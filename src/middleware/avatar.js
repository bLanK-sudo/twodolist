const multer = require('multer')
const path = require('path')
const storage = multer.memoryStorage()
const upload = multer({
    limits:{
        fileSize:5000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png|)$/)){
            return cb(new Error('Please upload an image of JPG, JPEG or PNG format!'))
        }
        cb(undefined, true)
    },
    storage
})
module.exports = upload