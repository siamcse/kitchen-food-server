const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.leesidy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('kitchenFoodDb').collection('services');

        

    }
    finally{

    }
}

run().catch(e=>console.error(e))


app.get('/',(req,res)=>{
    res.send('server is running');
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})
