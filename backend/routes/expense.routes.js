const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/auth')
const {
    getExpenses,
    getExpenseMonths,
    getExpenseDays,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getSummary
} = require('../controllers/expense.controller')

router.use(requireAuth)

router.get('/summary', getSummary)

router.get('/', getExpenses)
router.get('/months', getExpenseMonths)
router.get('/days', getExpenseDays)
router.get('/:id', getExpenseById)
router.post('/',createExpense)
router.put('/:id',updateExpense)
router.delete('/:id',deleteExpense)

module.exports = router
