const mongoose = require('mongoose')
const validator = require('validator')
const {Schema} = mongoose
const taskSchema = new Schema({
    item:{
        type:String,
        required:true,
        trim:true
    },
    label:{
        type:String,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'users'
    }
},{
    timestamps:true
})
const Tasks = mongoose.model('tasks', taskSchema)

module.exports = Tasks