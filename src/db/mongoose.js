require('dotenv').config()
const mongoose = require('mongoose')
const url = "mongodb+srv://manish:Neelavathy14@cluster0.qj20i.mongodb.net/task-manager-api"
mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false, useCreateIndex:true})
