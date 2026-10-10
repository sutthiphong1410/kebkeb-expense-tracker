const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/auth')
const {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getSummary
} = require('../controllers/budget.controller')

router.use(requireAuth)

router.get('/summary', getSummary)

router.get('/', getBudgets)
router.get('/:id', getBudgetById)
router.post('/',createBudget)
router.put('/:id',updateBudget)
router.delete('/:id',deleteBudget)

module.exports = router
