const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjhl6td.mongodb.net/?retryWrites=true&w=majority`;



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
        client.connect();

        const donationsCollection = client.db("BloodDonation").collection("donations");


        // get api for donation 
        app.get('/donate', async (req, res) => {

            const result = await donationsCollection.find().toArray();
            res.send(result);
        })

        app.delete('/deletedata/:id', async (req, res) => {
            const user = req.body;
            const id = req.params.id;
            console.log(user);

            const query = {
                _id: new ObjectId(id)
            }
            const result = await donationsCollection.deleteOne(query);
            res.send(result);
        })

        // put api to update / edit donation data
        app.put('/updatedata/:id', async (req, res) => {
            const user = req.body;
            const id = req.params.id;
            console.log(user);

            const query = {
                _id: new ObjectId(id)
            }

            const options = { upsert: true }
            const donations = {
                $set: {
                    bloodGroup: user.bloodGroup,
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    age: user.age,
                    weight: user.weight,
                    gender: user.gender,
                    available: user.available,
                    district: user.district
                }
            }
            console.log('updated data:', donations);
            const result = await donationsCollection.updateOne(query, donations, options);
            res.send(result);
        })

        // post api to save donated data in DB
        app.post('/donate', async (req, res) => {

            const donation = req.body;
            console.log(donation);

            const query = { email: req.body.email }
            console.log(query);
            const existing = await donationsCollection.findOne(query);
            if (existing) {
                return res.send({ message: 'already exist', insertedId: null })
            }

            const result = await donationsCollection.insertOne(donation);
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
    res.send('Your Task-TS server online!');
});

// Start the server
app.listen(port, () => {
    console.log(`Task-TS Server is running on port ${port}`);
});
