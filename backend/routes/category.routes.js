const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/auth')
const { getSummary, getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller')


router.use(requireAuth)

router.get('/summary', getSummary)

router.get('/', getCategories)
router.get('/:id', getCategoryById)
router.post('/',createCategory)
router.put('/:id',updateCategory)
router.delete('/:id',deleteCategory)

module.exports = router
