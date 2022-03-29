const mongoose = require('mongoose')
const validator = require('validator')
const {Schema} = mongoose
const labelSchema = new Schema({
    label:{
        type:String,
        default:null
    },
    owner:{
        type:String,
        required:true,
        ref:'tasks'
    }
})

const Label = mongoose.model('labels', labelSchema)

module.exports = Label