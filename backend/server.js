require('dotenv').config()
const app = require('./app')
const { initDb } = require('./config/db')

const PORT = process.env.PORT || 5000

initDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        console.error('Failed to init database:', err)
        process.exit(1)
    })