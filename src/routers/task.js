const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const app = express()
const router = new express.Router()
app.use(express.json())

router.post('/tasks', auth, async (req, res) => {
    req.body.label = req.body.label.toUpperCase()
    const task = new Task({
        ...req.body,
        owner:req.user._id 
    })
    try {
        await task.save()
        res.redirect('/me')
    } catch (e) {
        res.status(400).send(e)
    }
})



router.post('/checked', auth, async (req, res) => {
    const _id = req.body.taskId
    const done = req.body.done
    let checked
    if(done === 'true'){
        checked = false
    }else if(done === 'false'){
        checked = true
    }
    try{
        const task = await Task.findOneAndUpdate({_id}, {completed: checked})
        await task.save()
        console.log(checked);
        if(!task){
            res.status(400).send()
        }
        res.redirect('/me')
    } catch (e) {
        res.status(400).send(e)
    }
})



router.post('/me/delete', auth, async (req, res) => {
    const _id = req.body.id
    try{
        const task = await Task.findOneAndDelete({_id, owner:req.user._id})
    if(!task){
        res.status(400).send({Error:"User not found!"})
    }
    res.redirect('/me')
    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/deleteAll', auth, async (req, res) => {
    try {
        const task = await Task.deleteMany({completed:true})
        res.redirect('/done')
    } catch (e) {
        res.status(500).send(e)
    }

})

module.exports = router