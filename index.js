const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000


app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.send('hello world')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3azmgms.mongodb.net/?retryWrites=true&w=majority`;

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
   

    // jwt
  app.post("/api/v1/jwt", async(req, res) => {
    const email = req.body
    console.log(email)
    const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})
    res
    .cookie('token',token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    })
    .send({message: "success"})
  })

  app.post("/api/v1/logout", async(req, res)=> {
    const email = req.body;
    res
    .clearCookie("token", {
      maxAge: 0,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
    })
    .send({message: "logged Out"})
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.listen(port, ()=> {
    console.log(`server is running at http://localhost:${port}`)
})