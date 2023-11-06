const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// respond with "hello world" when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("hello world");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3azmgms.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const servicesCollection = client
      .db("serviceSquadDB")
      .collection("services");
    const bookingCollection = client
      .db("serviceSquadDB")
      .collection("bookings");

    // jwt
    app.post("/api/v1/jwt", async (req, res) => {
      const email = req.body;
      console.log(email);
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ message: "success" });
    });

    app.post("/api/v1/logout", async (req, res) => {
      const email = req.body;
      res
        .clearCookie("token", {
          maxAge: 0,
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ message: "logged Out" });
    });

    app.post("/api/vi/add-service", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    app.get("/api/vi/services", async (req, res) => {
      let query = {};
      if (req?.query?.name) {
        query = {
          serviceName: {
            $regex: req.query.name,
            $options: "i",
          },
        };
      }
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/api/v1/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.get("/api/v1/user-services", async (req, res) => {
      const query = {
        email: req.query.email,
      };
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    app.put("/api/vi/update-service/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const {
        servicePhoto,
        serviceName,
        providerName,
        providerPhoto,
        email,
        price,
        serviceArea,
        description,
      } = req.body

      const updateService = {
        $set: {
          servicePhoto,
          serviceName,
          providerName,
          providerPhoto,
          email,
          price,
          serviceArea,
          description
        }
      };

      const result = await servicesCollection.updateOne(filter, updateService)
      res.send(result)
    });

    app.post("/api/v1/add-booking", async (req, res) => {
      const bookedService = req.body;
      const result = await bookingCollection.insertOne(bookedService);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});
