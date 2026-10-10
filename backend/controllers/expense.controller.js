const { pool } = require('../config/db')

const TYPES = ['expense', 'income']
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const parseId = (value) => {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null
}

const round2 = (n) => Math.round(n * 100) / 100

const currentMonth = () =>
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' }).slice(0, 7)

const handleError = (err, res, label) => {
    if (err.code === '22007' || err.code === '22008') {
        return res.status(400).json({ error: 'date ไม่ถูกต้อง (ใช้รูปแบบ YYYY-MM-DD)' })
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

const categoryBelongsToUser = async (categoryId, userId) => {
    const id = parseId(categoryId)
    if (!id) return false
    const { rowCount } = await pool.query(
        'SELECT 1 FROM categories WHERE id = $1 AND user_id = $2',
        [id, userId]
    )
    return rowCount > 0
}

const isValidAmount = (amount) => {
    const n = Number(amount)
    return amount !== '' && Number.isFinite(n) && n > 0
}

const getExpenses = async (req, res) => {
    const { type, category, month, date } = req.query

    if (type && !TYPES.includes(type)) {
        return res.status(400).json({ error: "type ต้องเป็น 'expense' และ 'income' เท่านั้น" })
    }
    if (month && !MONTH_RE.test(month)) {
        return res.status(400).json({ error: 'month ต้องเป็นรูปแบบ YYYY-MM' })
    }
    if (date && !DATE_RE.test(date)) {
        return res.status(400).json({ error: 'date ต้องเป็นรูปแบบ YYYY-MM-DD' })
    }

    const params = [req.userId]
    let query = `
        SELECT e.*, c.name AS category_name
        FROM expenses e 
        LEFT JOIN categories c ON c.id =e.category_id
        WHERE e.user_id = $1`

    if (type) {
        params.push(type)
        query += ` AND e.type = $${params.length}`
    }

    if (category) {
        params.push(`%${category}%`)
        query += ` AND c.name ILIKE $${params.length}`
    }

    if (month) {
        params.push(month)
        query += ` AND to_char(e.date, 'YYYY-MM') = $${params.length}`
    }

    if (date) {
        params.push(date)
        query += ` AND e.date = $${params.length}::date`
    }

    query += ' ORDER BY e.date DESC, e.id DESC'

    try {
        const { rows } = await pool.query(query, params)
        res.json(rows)
    } catch (err) {
        handleError(err, res, 'getExpenses')
    }
}

const getExpenseById = async (req, res) => {
    const id = parseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    try {
        const { rows: [expense] } = await pool.query(
            'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )
        if (!expense) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json(expense)
    } catch (err) {
        handleError(err, res, 'getExpenseById')
    }
}

const createExpense = async (req, res) => {
    const { amount, category_id, description, type, date } = req.body

    if (!amount || !category_id || !type || !date) {
        return res.status(400).json({ error: 'กรุณากรอก amount, category_id, type, date ให้ครบ' })
    }

    if (!TYPES.includes(type)) {
        return res.status(400).json({ error: 'type ต้องเป็น income หรือ expense เท่านั้น' })
    }

    if (!isValidAmount(amount)) {
        return res.status(400).json({ error: 'amount ต้องเป็นตัวเลขที่มากกว่า 0' })
    }

    if (!DATE_RE.test(date)) {
        return res.status(400).json({ error: 'date ต้องเป็นรูปแบบ YYYY-MM-DD' })
    }

    try {
        if (!(await categoryBelongsToUser(category_id, req.userId))) {
            return res.status(400).json({ error: 'ไม่พบหมวดหมู่นี้' })
        }

        const { rows: [expense] } = await pool.query(
            `INSERT INTO expenses (user_id, amount, category_id, description, type, date)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.userId, amount, category_id, description || '', type, date]
        )
        res.status(201).json(expense)
    } catch (err) {
        handleError(err, res, 'createExpense')
    }
}

const updateExpense = async (req, res) => {
    const { amount, category_id, description, type, date } = req.body
    const id = parseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    if (type !== undefined && !TYPES.includes(type)) {
        return res.status(400).json({ error: 'type ต้องเป็น income และ expense เท่านั้น' })
    }
    if (amount !== undefined && !isValidAmount(amount)) {
        return res.status(400).json({ error: 'amount ต้องเป็นตัวเลขที่มากกว่า 0' })
    }
    if (date !== undefined && !DATE_RE.test(date)) {
        return res.status(400).json({ error: 'date ต้องเป็นรูปแบบ YYYY-MM-DD' })
    }

    try {
        if (category_id !== undefined && !(await categoryBelongsToUser(category_id, req.userId))) {
            return res.status(400).json({ error: 'ไม่พบหมวดหมู่นี้' })
        }

        const { rows: [updated] } = await pool.query(
            `UPDATE expenses
             SET amount      = COALESCE($1::numeric, amount),
                 category_id = COALESCE($2::int, category_id),
                 description = COALESCE($3::text, description),
                 type        = COALESCE($4::text, type),
                 date        = COALESCE($5::date, date)
            WHERE id = $6 AND user_id = $7
            RETURNING *`,
            [
                amount ?? null,
                category_id ?? null,
                description ?? null,
                type ?? null,
                date ?? null,
                id,
                req.userId
            ]
        )

        if (!updated) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        res.json(updated)
    } catch (err) {
        handleError(err, res, 'updateExpense')
    }
}

const deleteExpense = async (req, res) => {
    const id = parseId(req.params.id)
    if (!id) return res.status(404).json({ error: 'ไม่พบรายการนี้' })

    try {
        const { rowCount } = await pool.query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )
        if (rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบรายการนี้' })
        }
        return res.json({ message: 'ลบรายการเรียบร้อยแล้ว' })
    } catch (err) {
        handleError(err, res, 'deleteExpense')
    }
}

const getSummary = async (req, res) => {
    const month = MONTH_RE.test(req.query.month) ? req.query.month : currentMonth()
    const start = `${month}-01`

    try {
        const [totalsR, byCategoryR, budgetsR, byMonthR] = await Promise.all([
            pool.query(
                `SELECT type, ROUND(SUM(amount), 2) AS total
                FROM expenses
                WHERE user_id = $1
                    AND date >= $2::date AND date < $2::date + INTERVAL '1 month'
                GROUP BY type`,
                [req.userId, start]
            ),
            pool.query(
                `SELECT c.id AS category_id, c.name AS category, ROUND(SUM(e.amount), 2) AS total
                 FROM expenses e
                 JOIN categories c ON c.id = e.category_id
                 WHERE e.user_id = $1
                    AND e.type = 'expense'
                    AND e.date >= $2::date AND e.date < $2::date + INTERVAL '1 month'
                GROUP BY c.id, c.name
                ORDER BY total DESC`,
                [req.userId, start]
            ),
            pool.query(
                `SELECT
                    b.id AS budget_id,
                    c.id AS category_id,
                    c.name AS category,
                    b.amount AS budget,
                    COALESCE(SUM(e.amount), 0) AS spent
                FROM budgets b
                JOIN categories c ON c.id = b.category_id
                LEFT JOIN expenses e
                    ON e.category_id = b.category_id
                    AND e.user_id = b.user_id
                    AND e.type = 'expense'
                    AND to_char(e.date, 'YYYY-MM') = b.month
                WHERE b.user_id = $1 AND b.month = $2
                GROUP BY b.id, c.id, c.name, b.amount
                ORDER BY COALESCE(SUM(e.amount), 0) / NULLIF(b.amount, 0) DESC NULLS LAST`,
                [req.userId, month]
            ),
            pool.query(
                `SELECT to_char(date, 'YYYY-MM') AS month, type, ROUND(SUM(amount), 2) AS total
                 FROM expenses
                 WHERE user_id = $1
                    AND date >= $2::date AND date < $2::date + INTERVAL '1 month'
                 GROUP BY 1, 2
                 ORDER BY 1 ASC`,
                [req.userId, start]
            ),
        ])

        const totals = totalsR.rows
        const budgets = budgetsR.rows

        const income = totals.find((t) => t.type === 'income')?.total || 0
        const expense = totals.find((t) => t.type === 'expense')?.total || 0
        const totalBudget = budgets.reduce((s, b) => s + b.budget, 0)
        const budgetedSpent = budgets.reduce((s, b) => s + b.spent, 0)

        res.json({
            month,
            totalIncome: income,
            totalExpense: expense,
            balance: round2(income - expense),
            totalBudget: round2(totalBudget),
            budgetRemaining: round2(totalBudget - budgetedSpent),
            budgets,
            byCategory: byCategoryR.rows,
            byMonth: byMonthR.rows
        })
    } catch (err) {
        handleError(err, res, 'getSummary')
    }
}

const getExpenseMonths = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT DISTINCT to_char(date, 'YYYY-MM') AS month
             FROM expenses
             WHERE user_id = $1
             ORDER BY month DESC`,
            [req.userId]
        )
        return res.json(rows.map((r) => r.month))
    } catch (err) {
        handleError(err, res, 'getExpenseMonths')
    }
}

const getExpenseDays = async (req, res) => {
    const { month } = req.query
    if (!MONTH_RE.test(month)) {
        return res.status(400).json({ error: "month ต้องเป็นรูปแบบ YYYY-MM" })
    }

    try {
        const { rows } = await pool.query(
            `SELECT DISTINCT date
             FROM expenses
             WHERE user_id = $1
                AND date >= $2::date AND date < $2::date + INTERVAL '1 month'
             ORDER BY date`,
            [req.userId, `${month}-01`]
        )
        res.json(rows.map((r) => r.date))
    } catch (err) {
        handleError(err, res, 'getExpenseDays')
    }
}

module.exports = {
    getExpenses,
    getExpenseById,
    getExpenseDays,
    getExpenseMonths,
    createExpense,
    updateExpense,
    deleteExpense,
    getSummary
}