require('dotenv').config()
const express = require('express')
const cors = require('cors')

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())


const authRoute = require('./routes/auth.routes')
const categoryRoute = require('./routes/category.routes')
const expenseRoute = require('./routes/expense.routes')
const budgets = require('./routes/budget.routes')

const app = express();


app.use(cors({
    origin: (origin, callback) => {
        // origin เป็น undefined เมื่อไม่ได้มาจากเบราว์เซอร์ (เช่น curl, Thunder Client, health check)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        callback(new Error('Not allowed by CORS'))
    },
}))
app.use(express.json())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use('/api/categories', categoryRoute)
app.use('/api/auth', authRoute)
app.use('/api/expenses', expenseRoute)
app.use('/api/budgets', budgets)

app.use((req, res) => {
    res.status(404).json({ error: 'ไม่พบ endpoint นี้' })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบางอย่างในเซิร์ฟเวอร์' })
})


module.exports = app