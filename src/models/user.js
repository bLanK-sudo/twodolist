const mongoose = require('mongoose')
const validator = require('validator')
const {Schema} = mongoose
const bcrypt = require('bcrypt')
const Task = require('../models/task')
const jwt = require('jsonwebtoken')
const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Not a valid email id')
            }           
        }
    },
    password:{
        type:String,
        required:true,
        minLength:7,
        trim:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain password')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})


//CREATING VIRTUAL TASKS ARRAY
userSchema.virtual('tasks', {
    ref:'tasks',
    localField:'_id',
    foreignField:'owner'
})


//HIDING PRIVATE DATA
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}


//CREATING JWT
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id},'mysecretisunknown' )
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


//LOGGING IN USERS
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}


//HASHING PASSWORD
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 10)
    }
    next()
})

//DELETING USER
userSchema.pre('remove', async function(next) {
    const user = this
    const task = await Task.deleteMany({owner: user._id})
    next()
})


const User = mongoose.model('users', userSchema)
module.exports = User