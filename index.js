const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs-extra');
const { ObjectId } = require('mongodb');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 3003;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r6p6q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('services'));
app.use(fileUpload());

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orDers");
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("sErvice");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reView");


    app.post('/addOrder', (req, res) => {
        const orderedService = req.body
        orderCollection.insertOne(orderedService)
            .then(result => res.send(result.insertedCount > 0))
    })

    app.get('/allServices', (req, res) => {
        serviceCollection.find()
            .toArray((err, result) => res.send(result))
    })

    app.get('/allReviews', (req, res) => {
        reviewCollection.find()
            .toArray((err, result) => res.send(result))
    })


    app.get('/admin', (req, res) => {
        const userEmail = req.query.email;
        adminCollection.find({ email: userEmail })
            .toArray((err, result) => res.send(result))
    })

    

    app.get('/orderdServices', (req, res) => {
        const userEmail = req.query.email;
        orderCollection.find({ userEmail: userEmail })
            .toArray((err, result) => res.send(result))
    })

    app.post('/addReview', (req, res) => {
        const review = req.body
        reviewCollection.insertOne(review)
            .then(result => res.send(result.insertedCount > 0))
    })

    app.get('/allOrderdServices', (req, res) => {
        orderCollection.find()
            .toArray((err, result) => res.send(result))
    })

    app.patch('/updateStatus/:id', (req, res) => {
        const id = req.params.id
        orderCollection.updateOne({ _id: ObjectId(id) },
            {
                $set: { status: req.body.value },
            })
            .then(result => res.send(result.modifiedCount > 0))
    })


    app.post('/addService', (req, res) => {
        const file = req.files.file
        const title = req.body.title
        const description = req.body.description
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, image })
            .then(result => res.send(result.insertedCount > 0))
    })

    app.post('/addAdmin', (req, res) => {
        const admin = req.body
        adminCollection.insertOne(admin)
            .then(result => res.send(result.insertedCount > 0))
    })




});







app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(PORT, () => console.log(`Listening on ${PORT}`));