const express = require('express')
const userRouter = require('./routers/user')
const path = require('path')
const publicDir = path.join(__dirname, '../public')
const taskRouter = require('./routers/task')
require('./db/mongoose')
const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(express.static(publicDir))
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
