const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
// middleware 
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://online-shopping:pYThHXtOlTgRPDCO@cluster0.dv2hq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db("online-shopping").collection("users");

  
     //post sinUp users all info
      app.post('/users', async (req, res) => {
   const newuser=req.body;
    const existingUser = await userCollection.findOne({ email :newuser.email});
    if (existingUser) {
        return res.status(400).json({ message: "User already exist" });
    }
    const result = await userCollection.insertOne(newuser);
    res.json(result);
});


    //get users registered data
     app.get('/users', async (req, res) => {
      const email = req.query.email;
      let result;
      if(email){
        const query = { email: email };
        result = await userCollection.find(query).toArray();  
      } 
      else{
     result=await userCollection.find().toArray();
      }
       res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Shoppinggggggggggggg');
});

app.listen(port, () => {
    console.log(`Online shopping is running at: ${port}`);
});
