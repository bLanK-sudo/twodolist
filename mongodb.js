const {MongoClient, ObjectId} = require('mongodb')
const connectionURL = 'mongodb://localhost:27017'
const dbName = 'task-manager'
const id = new ObjectId()
console.log(id.getTimestamp());
MongoClient.connect(connectionURL, {useNewUrlParser: true, useUnifiedTopology:true}, (err, client) => {
    if(err) return err
    else console.log("working correctly");
    const db = client.db(dbName)
    // db.collection('user').insertOne({
    //     _id:id,
    //     name:'Akshar',
    //     age:12,
    //     time: id.getTimestamp()
    // }, (error, result) =>{
    //     if(error) return err
    //     else console.log(result.insertedId);
    // })
    // db.collection('tasks').insertMany([
    //     {
    //         description:"Buy egg",
    //         completed:true
    //     },
    //     {
    //         description:"Buy milk",
    //         completed:false
    //     },
    //     {
    //         description:"Drink water",
    //         completed:false
    //     }
    // ], (error, result) => {
    //     if(error) return error
    //     else console.log(result.insertedIds);
    // })
    db.collection('tasks').updateMany({}, {$set:{completed:true}}).then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    })
})