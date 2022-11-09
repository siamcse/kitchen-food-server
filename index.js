const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.leesidy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('kitchenFoodDb').collection('services');
        const reviewCollection = client.db('kitchenFoodDb').collection('reviews');

        //services data read
        app.get('/services', async (req, res) => {

            const query = {};
            const count = await serviceCollection.estimatedDocumentCount();
            const size = parseInt(req.query.size) || count;
            const cursor = serviceCollection.find(query).limit(size);
            const services = await cursor.toArray();
            res.send({ count, services });
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //service added
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        //reviews data read
        app.get('/reviews',async(req,res)=>{
            const email = req.query.email;
            const query = {email: email}
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/reviews/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {serviceId: id};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })
        app.get('/review/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })

        

        //reviews added
        app.post('/reviews',async(req,res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        //review edit
        app.patch('/review/:id',async(req,res)=>{
            const id = req.params.id;
            const review = req.body;
            console.log(review);
            const query = {_id: ObjectId(id)};
            const updateReview = {
                $set:{
                    name: review.name,
                    rating: review.rating,
                    image: review.image,
                    comment: review.comment
                }
            }
            const result = await reviewCollection.updateOne(query, updateReview);
            res.send(result);

        })
        //reviews delete
        app.delete('/reviews/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
}

run().catch(e => console.error(e))


app.get('/', (req, res) => {
    res.send('server is running');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
