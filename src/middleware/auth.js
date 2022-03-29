const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Task = require('../models/task')
const auth = async(req, res, next) => {
    try{
        const token = req.headers.cookie.split('=')[1]
        const decoded = jwt.verify(token,'mysecretisunknown' )
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        if(!user){
            return res.redirect('/signin')
        }
        req.token = token
        req.user = user
        req.tasks = await Task.find({owner: decoded._id})
        next()
    }catch (e) {
        console.log(e);
        res.status(401).send('Your request is not authenticated')
    } 
}

module.exports = auth