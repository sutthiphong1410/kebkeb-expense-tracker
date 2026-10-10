const { pool } = require('../config/db')

const TYPES = ['expense', 'income']
// const db = require('../config/db')

const parseId = (value) => {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null
}

const handleError = (err, res, label) => {
    if (err.code === '23505') {
        return res.status(409).json({ error: 'มีหมวดหมู่ชื่อและประเภทนี้อยู่แล้ว' })
    }

    console.error(`${label} error:`, err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' })
}

const createCategory = async (req, res) => {
    const { name, type } = req.body

    if (!name || !type) {
        return res.status(400).json({ error: 'กรุณากรอก name, type ให้ครบ' })
    }
    if (!TYPES.includes(type)) {
        return res.status(400).json({ error: "type ต้องเป็น 'expense' หรือ 'income' เท่านั้น" })
    }

    try {
        const { rows: [category] } = await pool.query(
            `INSERT INTO categories (user_id, name, type)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.userId, name, type]
        )
        res.status(201).json(category)
    } catch (err) {
        if (err.code === '23503') {
            return res.status(401).json({ error: 'กรุณา login ใหม่' })
        }
        handleError(err, res, 'createCategory')
    }
}

const getCategories = async (req, res) => {
    const { category, type, active } = req.query

    const params = [req.userId]
    let query = 'SELECT * FROM categories WHERE user_id = $1'

    if (category) {
        params.push(`%${category}%`)
        query += ` AND name ILIKE $${params.length}`
    }

    if (type && TYPES.includes(type)) {
        params.push(type)
        query += ` AND type = $${params.length}`
    }

    if (active !== undefined) {
        params.push(active === 'true' || active === '1')
        query += ` AND is_active = $${params.length}`
    }

    query += ' ORDER BY id DESC'

    try {
        const { rows } = await pool.query(query, params)
        res.json(rows)
    } catch (err) {
        handleError(err, res, 'getCategories')
    }
}

const getCategoryById = async (req, res) => {
    const id = parseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    try {
        const { rows: [category] } = await pool.query(
            'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )
        if (!category) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json(category)
    } catch (err) {
        handleError(err, res, 'getCategoryById')
    }
}

const updateCategory = async (req, res) => {
    const { name, type } = req.body
    const id = parseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    if (type !== undefined && !TYPES.includes(type)) {
        return res.status(400).json({ error: "type ต้องเป็น 'expense' และ 'income' เท่านั้น" })
    }

    try {

        const { rows: [updated] } = await pool.query(
            `UPDATE categories
             SET name = COALESCE($1, name),
                 type = COALESCE($2, type),
                 updated_at = NOW()
             WHERE id = $3 AND user_id = $4
             RETURNING *`,
            [name ?? null, type ?? null, id, req.userId]
        )

        if (!updated) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json(updated)
    } catch (err) {
        handleError(err, res, 'updateCategory')
    }
}

const deleteCategory = async (req, res) => {
    const id = parseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM categories WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )
        if (rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json({message: 'ลบรายการเรียบร้อยแล้ว'})
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({
                error: 'ลบไม่ได้ เพราะมีรายการรายรับ/รายจ่ายหรืองบประมาณที่ใช้หมวดหมู่นี้อยู่'
            })
        }
        handleError(err, res, 'deleteCategory')
    }
}

const getSummary = async (req, res) => {
    const month =
        req.query.month ||
        new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }).slice(0, 7)

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({ error: 'month ต้องเป็นรูปแบบ YYYY-MM' })
    }

    try {
        const { rows } = await pool.query(
            `SELECT
                b.category_id,
                c.name AS category,
                b.amount AS budget,
                COALESCE(SUM(e.amount), 0) AS spent
            FROM budgets b
            JOIN categories c ON c.id = b.category_id
            LEFT JOIN expenses e
                ON e.user_id = b.user_id
                AND e.category_id = b.category_id
                AND e.type = 'expense'
                AND to_char(e.date, 'YYYY-MM') = b.month
            WHERE b.user_id = $1
                AND b.month = $2
            GROUP BY b.id, b.category_id, c.name, b.amount
            ORDER BY c.name`,
            [req.userId, month]
        )
        res.json({ month, totals: rows })
    } catch (err) {
        handleError(err, res, 'getSummary')
    }
}



// const createCategory = (req, res) => {
//     const { name, type } = req.body

//     if (!name || !type) {
//         return res.status(400).json({ error: 'กรุณากรอก name, type ให้ครบ' })
//     }


//     const result = db
//         .prepare(
//             `INSERT into categories (user_id, name, type)
//         VALUES (?,?,?)`

//         )
//         .run(
//             req.userId, name, type
//         )

//     const newCategories = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
//     res.status(201).json(newCategories)
// }

// const getCategories = (req, res) => {
//     const { category, type, active } = req.query

//     let query = 'SELECT * FROM categories WHERE user_id = ?'
//     const params = [req.userId]

//     if (category) {
//         query += ' AND name LIKE ?'
//         params.push(`%${category}%`)
//     }

//     query += ' ORDER BY id DESC'

//     const categories = db.prepare(query).all(...params)
//     res.json(categories)
// }

// const getCategoryById = (req, res) => {
//     const category = db
//         .prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
//         .get(req.params.id, req.userId)

//     if (!category) {
//         return res.status(404).json({ error: 'ไม่พบรายการนี้' })
//     }
//     res.json(category)
// }

// const updateCategory = (req, res) => {
//     const { name, type } = req.body

//     const exsiting = db
//         .prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
//         .get(req.params.id, req.userId)

//     if (!exsiting) {
//         return res.status(404).json({ error: 'ไม่พบรายการนี้' })
//     }

//     db.prepare(
//         `UPDATE categories SET name = ?, type = ?
//         WHERE id = ? AND user_id = ?`
//     ).run(
//         name ?? exsiting.name,
//         type ?? exsiting.type,
//         req.params.id,
//         req.userId
//     )

//     const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
//     res.json(updated)
// }

// const deleteCategory = (req, res) => {
//     const existing = db
//         .prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?')
//         .get(req.params.id, req.userId)

//     if (!existing) {
//         return res.status(404).json({ error: 'ไม่พบรายการนี้' })
//     }

//     db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
//         .run(req.params.id, req.userId)
//     res.json({ message: 'ลบรายการเรียบร้อยแล้ว' })
// }

// const getSummary = (req, res) => {
//     const totals = db
//         .prepare(`SELECT
//                     b.category,
//                     b.amount AS budget,
//                     COALESCE(SUM(e.amount), 0) AS spent
//                 FROM budgets b

//                 LEFT JOIN expenses e
//                     ON e.user_id = b.user_id
//                     AND e.category = b.category
//                     AND e.type = 'expense'
//                     AND strftime('%Y-%m', e.date) = b.month

//                 WHERE b.user_id = ?
//                 AND b.month = ?

//                 GROUP BY
//                     b.id,
//                     b.category,
//                     b.amount;`
//         )

//     res.json({ totals: totals })
// }


module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getSummary
}