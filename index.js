const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.leesidy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('kitchenFoodDb').collection('services');
        const reviewCollection = client.db('kitchenFoodDb').collection('reviews');
        const blogCollection = client.db('kitchenFoodDb').collection('blogs');

        //jwt email sign
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '1h' });
            console.log(token);
            res.send({ token });
        })

        //services data read
        app.get('/services', async (req, res) => {

            const query = {};
            const count = await serviceCollection.estimatedDocumentCount();
            const size = parseInt(req.query.size) || count;
            const cursor = serviceCollection.find(query).limit(size).sort({ $natural: -1 });
            const services = await cursor.toArray();
            res.send({ count, services });
        })
        //service details read
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //service post
        app.post('/services', verifyJWT, async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        //my reviews data read
        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded);
            const email = req.query.email;
            if(decoded.email!==email){
                res.status(403).send({ message: 'Unauthorized access' });
            }
            const query = { email: email }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        //review read for particular service
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const cursor = reviewCollection.find(query).sort({ $natural: -1 });
            const review = await cursor.toArray();
            res.send(review);
        })
        //review read for service review edit
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query);
            res.send(review);
        })



        //reviews added
        app.post('/reviews',verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })
        //review edit
        app.patch('/review/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const review = req.body;
            const query = { _id: ObjectId(id) };
            const updateReview = {
                $set: {
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
        app.delete('/reviews/:id',verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        //our service speciality blogs
        app.get('/speciality',async(req,res)=>{
            const query = {};
            const cursor = blogCollection.find(query);
            const result = await cursor.toArray();
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
