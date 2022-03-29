const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cookieParser = require('cookie-parser')
const auth = require('../middleware/auth')
const upload = require('../middleware/avatar')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')
const filePath = './avatar/'
const User = require('../models/user')
const Task = require('../models/task')
const {
    Binary
} = require('mongodb')
const { pathToFileURL } = require('url')
app.use(cookieParser())
const router = new express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
let avatar
app.use(router);
app.set('views', path.join(__dirname, '../../views'))
app.set('view engine', 'ejs');
router.get('/', async (req, res) => {
    res.render('index.ejs')
})
router.get('/signin', async (req, res) => {
    res.render('signin.ejs', {
        message: ''
    })
})
router.get('/signup', async (req, res) => {
    res.render('signup.ejs', {
        message: ''
    })
})
router.get('/me', auth, async (req, res) => {
    const match = {
        completed: 'false'
    }
    if (req.query.label !== undefined) {
        match.label = req.query.label
    }
    if (req.query.completed !== undefined) {
        match.completed = req.query.completed
    }
    const labelSet = new Set()
    req.tasks.forEach(item => {
        if (item.completed === false) {
            labelSet.add(item.label)
        } else {}
    })
    const labelArr = Array.from(labelSet)
    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            limit: 10,
            skip: parseInt(req.query.skip)
        }
    }).execPopulate()
    if(req.user.avatar){
        avatar = req.user.avatar.toString('base64')
    }
    res.render('task.ejs', {
        newListItems: req.user.tasks,
        user: req.user,
        label: labelArr,
        avatar
    })
})
router.get('/profile', auth, async (req, res) => {
    const {
        name,
        email
    } = req.user
    if(req.user.avatar){
        avatar = req.user.avatar.toString('base64')
    }
    res.render('profile.ejs', {
        name,
        email,
        avatar,
        message:''
    })
})

router.get('/done', auth, async (req, res) => {
    const match = {
        completed: 'true'
    }
    if (req.query.label !== undefined) {
        match.label = req.query.label
    }
    if (req.query.completed !== undefined) {
        match.completed = req.query.completed
    }
    const labelSet = new Set()
    req.tasks.forEach(item => {
        if (item.completed === true) {
            labelSet.add(item.label)
        } else {}
    })
    const labelArr = Array.from(labelSet)
    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            limit: 10,
            skip: parseInt(req.query.skip)
        }
    }).execPopulate()
    if(req.user.avatar){
        avatar = req.user.avatar.toString('base64')
    }
    res.render('completed.ejs', {
        newListItems: req.user.tasks,
        user: req.user,
        label: labelArr,
        avatar
    })
})

router.get('/change', auth, async(req, res) => {
    const {name, email} = req.user
    res.render('change.ejs', {name, email, message:''})
})

router.post('/signup', async (req, res) => {
    const data = req.body
    const user = new User(data)
    try {
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        await user.save()
        return res.redirect('/me')
    } catch (e) {
            return res.render('signup.ejs', {
                message: e._message
            })
    }
})

router.post('/signin', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        res.redirect('/me')

    } catch (e) {
        console.log(e);
        return res.render('signin.ejs', {
            message: 'Incorrect login details!'
        })
    }

})

router.post('/signout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.redirect('/')
    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/signoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }

})

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    if(!req.file){
        return res.render('profile.ejs', {
            message: 'Upload an image to submit!',
            email:req.user.email,
            name:req.user.name,
            avatar:req.user.avatar     
        })
    }
    const buffer = await sharp(req.file.buffer).resize(200, 200).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.redirect('/profile')
}, (err, req, res, next) => {
    if (err) {
        res.render('profile.ejs', {
            message: err.message,
            email:req.user.email,
            name:req.user.name,
            avatar:req.user.avatar     
        })
    }
})

router.post('/change', auth, async (req, res) => {
    const update = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password']
    const isAllowed = update.every(update => allowedUpdates.includes(update))
    const _id = req.user._id
    if (!isAllowed) {
        return res.status(404).send({
            error: "invalid update"
        })
    }
    try {
        const user = await User.findById(_id)
        update.forEach(update => user[update] = req.body[update])
        await user.save()
        res.redirect('/me')
    } catch (e) {
        const {name, email} = req.user
        return res.render('change.ejs', {name, email, message:e.message})
    }
})

router.post('/delete-user', auth, async (req, res) => {
    try {
        await Task.deleteMany({owner:req.user._id})
        await req.user.remove()
        res.redirect('/signup')
    } catch (e) {
        res.status(500).send(e)
    }

})


module.exports = router