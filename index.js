const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const productCollection=client.db("online-shopping").collection("products");
    const cartProductCollection=client.db("online-shopping").collection("cartItem");

  //post sinUp users all info
  app.post('/users', async (req, res) => {
  const newUser = req.body;
  // Basic validation
  if (!newUser.email || !newUser.name || !newUser.role) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const existingUser = await userCollection.findOne({ email: newUser.email });
  if (existingUser) {
    return res.status(200).json({ message: "User already exists", alreadyExists: true });
  }
  const result = await userCollection.insertOne(newUser);
  res.status(201).json({ message: "User created", insertedId: result.insertedId });
});

//roll base user get
 app.get("/users/role", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query); 
      if (user) {
          res.send({ role: user.role });
         
      } else {
          res.status(404).send({ message: "User not found" });
      }
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

    //added product by seller
    app.post('/products', async (req, res) => {
  const product = req.body;
  const result = await productCollection.insertOne(product);
  res.send({
    success: true,
    insertedId: result.insertedId,
    message: "Product added successfully"
  });
});

//get all products
 app.get('/products', async (req, res) => {
  const { searchParam } = req.query;

  let query = {};
  if (searchParam) {
    query = {
      title: { $regex: searchParam, $options: "i" }
    };
  }

  const result = await productCollection.find(query).toArray();
  res.send(result);
});

//get a single product by id
app.get('/products/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await productCollection.findOne(query);
    res.send(result);
  })

  //add to cart post
  app.post('/cart', async (req, res) => {
  try {
    const cartItem = req.body;
    const result = await cartProductCollection.insertOne(cartItem);
    res.send(result); 
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send({ message: 'Failed to add to cart' });
  }
});

//get add to cart data
app.get("/cart", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).send({ error: "Email is required" });

  const query = { email: email };
  const result = await cartProductCollection.find(query).toArray();
  res.send(result);
});

app.get('/cart/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await cartProductCollection.findOne(query);
    res.send(result);
  })

//delete add cart data
 app.delete('/cart/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await cartProductCollection.deleteOne(query);
    res.send(result);
  })


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
