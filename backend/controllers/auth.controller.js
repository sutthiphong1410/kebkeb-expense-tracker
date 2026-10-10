const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

const defaultCategories = [
    ['อาหาร', 'expense'],
    ['เดินทาง', 'expense'],
    ['ช็อปปิ้ง', 'expense'],
    ['เงินเดือน', 'income'],
    ['ฟรีแลนซ์', 'income'],
    ['โบนัส', 'income'],
]

const register = async (req, res) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทั้ง (email, password, name)' })
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'password ต้องมีอย่างน้อย 6 ตัวอักษร' })
    }

    let client
    try {
        const passwordHash = await bcrypt.hash(password, 10)

        client = await pool.connect()
        await client.query('BEGIN')

        const { rows: [user] } = await client.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
            [email, passwordHash, name]
        )

        await client.query(
            `INSERT INTO categories (user_id, name, type)
            SELECT $1, c.name, c.type
            FROM unnest($2::text[], $3::text[]) AS c(name, type)`,
            [user.id, defaultCategories.map(c => c[0]), defaultCategories.map(c => c[1])]
        )

        await client.query('COMMIT')

        res.status(201).json({
            token: generateToken(user.id),
            user: { id: user.id, email, name }
        })

    } catch (err) {
        if (client) await client.query('ROLLBACK').catch(() => { })

        if (err.code === '23505') {
            return res.status(409).json({ error: 'อีเมลนี้ถูกใช้งานไปแล้ว' })
        }
        console.error('register error:', err)
        res.status(500).json({ error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' })
    } finally {
        if (client) client.release()
    }
}

const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'กรุณากรอก email และ password' })
    }

    try {
        const { rows: [user] } = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if(!user){
            return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'})
        }

        const isValid  = await bcrypt.compare(password, user.password_hash)
        if(!isValid){
            return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'})
        }

        res.json({
            token: generateToken(user.id),
            user: { id: user.id, name: user.name, email: user.email}
        })
    } catch (err) {
        console.error('login error:',err)
        res.status(500).json({error:'เกิดข้อผิดพลาดของเซิร์ฟเวอร์'})
    }
}


module.exports = { register, login }