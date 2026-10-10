const { pool } = require('../config/db')
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

const paseId = (value) => {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null
}

const currentMonth = () =>
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }).slice(0, 7)

const isValidAmount = (amount) => {
    const n = Number(amount)
    return amount !== '' && amount !== null && Number.isFinite(n) && n > 0
}

const handleError = (err, res, label) => {
    if (err.code === '23505') {
        return res.status(409).json({ error: 'หมวดหมู่นี้มีงบประมาณในเดือนนี้แล้ว' })
    }
    if (err.code === '22003') {
        return res.status(400).json({ error: 'amount มีค่ามากเกินไป' })
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'category_id ไม่ถูกต้อง' })
    }
    console.error(`${label} error:`, err)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' })
}

const isValidCategory = async (categoryId, userId) => {
    const id = paseId(categoryId)
    if (!id) return false
    const { rowCount } = await pool.query(
        `SELECT 1 FROM categories
         WHERE id = $1 AND user_id = $2 AND type = 'expense' AND is_active = TRUE`,
        [id, userId]
    )
    return rowCount > 0
}

const BUDGET_SELECT = `
    SELECT b.*, c.name AS category_name
    FROM budgets b
    LEFT JOIN categories c ON c.id = b.category_id`

const findBudget = async (id, userId) => {
    const { rows: [budget] } = await pool.query(
        `${BUDGET_SELECT} WHERE b.id = $1 AND b.user_id = $2`,
        [id, userId]
    )
    return budget
}

const createBudget = async (req, res) => {
    const { category_id, amount, month } = req.body

    if (!category_id || !amount || !month) {
        return res.status(400).json({ error: 'กรุณากรอก category_id, amount, month ให้ครบ' })
    }
    if (!isValidAmount(amount)) {
        return res.status(400).json({ error: 'amount ต้องเป็นเลขที่มากกว่า 0' })
    }
    if (!MONTH_RE.test(month)) {
        return res.status(400).json({ error: 'month ต้องเป็นรูปแบบ YYYY-MM' })
    }

    try {
        if (!(await isValidCategory(category_id, req.userId))) {
            return res.status(400).json({ error: 'หมวดหมู่ไม่ถูกต้อง' })
        }

        const { rows: [row] } = await pool.query(
            `INSERT INTO budgets (user_id, category_id, amount, month)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, category_id, month)
             DO UPDATE SET amount = EXCLUDED.amount, updated_at = NOW()
             RETURNING id, (xmax = 0) AS inserted`,
            [req.userId, category_id, Number(amount), month]
        )

        const budget = await findBudget(row.id, req.userId)
        res.status(row.inserted ? 201 : 200).json(budget)
    } catch (err) {
        handleError(err, res, 'createBudget')
    }
}

const getBudgets = async (req, res) => {
    const { category, month } = req.query

    if (month && !MONTH_RE.test(month)) {
        return res.status(400).json({ error: 'month ต้องเป็นรูปแบบ YYYY-MM' })
    }

    const params = [req.userId]
    let query = `${BUDGET_SELECT} WHERE b.user_id = $1`

    if (category) {
        params.push(`%${category}%`)
        query += ` AND c.name ILIKE $${params.length}`
    }
    if (month) {
        params.push(month)
        query += ` AND b.month = $${params.length}`
    }

    query += ' ORDER BY b.month DESC, b.id DESC'
    try {
        const { rows } = await pool.query(query, params)
        res.json(rows)
    } catch (err) {
        handleError(err, res, 'getBudgets')
    }
}

const getBudgetById = async (req, res) => {
    const id = paseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })
    try {
        const budget = await findBudget(id, req.userId)
        if (!budget) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json(budget)
    } catch (err) {
        handleError(err, res, 'getBudgetById')
    }
}

const updateBudget = async (req, res) => {
    const { category_id, amount, month } = req.body
    const id = paseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    if (amount !== undefined && !isValidAmount(amount)) {
        return res.status(400).json({ error: 'amount ต้องเป็นตัวเลขที่มากกว่า 0' })
    }
    if (month !== undefined && !MONTH_RE.test(month)) {
        return res.status(400).json({ error: 'month ต้องเป็นรูปแบบ YYYY-MM' })
    }
    try {
        const existing = await findBudget(id, req.userId)
        if (!existing) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }

        if (category_id !== undefined && Number(category_id) !== existing.category_id
            && !(await isValidCategory(category_id, req.userId))) {
            return res.status(400).json({ error: 'หมวดหมู่ไม่ถูกต้อง' })
        }

        await pool.query(
            `UPDATE budgets
             SET category_id = COALESCE($1::int, category_id),
                 amount     = COALESCE($2::numeric, amount),
                 month      = COALESCE($3::text, month),
                 updated_at = NOW()
             WHERE id = $4 AND user_id = $5`,
            [
                category_id ?? null,
                amount !== undefined ? Number(amount) : null,
                month ?? null,
                id,
                req.userId,
            ]
        )

        res.json(await findBudget(id, req.userId))
    } catch (err) {
        handleError(err, res, 'updateBudget')
    }
}

const deleteBudget = async (req, res) => {
    const id = paseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )

        if (rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json({ message: 'ลบรายการเรียบร้อยแล้ว' })
    } catch (err) {
        handleError(err, res, 'deleteBudget')
    }
}

const getSummary = async (req, res) => {
    const month = req.query.month || currentMonth()
    if (!MONTH_RE.test(month)) {
        return res.status(400).json({ error: 'month ต้องเป็นรูปแบบ YYYY-MM' })
    }
    try {
        const { rows } = await pool.query(
            `SELECT
                b.id,
                b.category_id,
                c.name AS category,
                b.amount AS budget,
                COALESCE(SUM(e.amount), 0) AS spent
             FROM budgets b
             LEFT JOIN categories c ON c.id = b.category_id
             LEFT JOIN expenses e
                ON e.user_id = b.user_id
                AND e.category_id = b.category_id
                AND e.type = 'expense'
                AND to_char(e.date, 'YYYY-MM') = b.month
            WHERE b.user_id = $1 AND b.month = $2
            GROUP BY b.id, b.category_id, c.name, b.amount
            ORDER BY c.name`,
            [req.userId, month]
        )
        res.json({ totals: rows })
    } catch (err) {
        handleError(err, res, 'getSummary')
    }
}


module.exports = {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getSummary
}