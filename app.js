require('dotenv').config()
const express = require("express");
const multer = require("multer");

const Port = "5454";
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = 'resume';
const client = new MongoClient(url);
const cors = require('cors')
const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// create/store resume data
app.post('/api/resume-data', async (req, res) => {
    try {
        console.log(req.body);
        const { resume_data } = req.body;

        const client = new MongoClient(url, { useUnifiedTopology: true });

        console.log('Connecting to MongoDB...');
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        console.log("mongo connected");

        const data = {
            resume_data: resume_data,
            createdAt: new Date()
        }

        const insertResult = await collection.insertOne(data);
        console.log('Data inserted into MongoDB');
        const id = insertResult.insertedId;
        const insertedData = await collection.findOne({ _id: id });
        await client.close();
        if (insertedData) {
            return res.status(200).json({
                status: true,
                message: 'Resume data inserted successfully.',
                data: insertedData
            });
        } else {
            return res.status(404).json({
                status: false,
                message: 'No record found',
                data: {}
            });
        }

    } catch (error) {
        console.error('Error handling uploaded file:', error);
        return res.status(500).json({ message: 'Error handling uploaded file' });
    }
});

// get all resume-data 
app.get('/api/resume-data', async (req, res) => {
    try {

        const client = new MongoClient(url, { useUnifiedTopology: true });

        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Convert the string ID to an ObjectId
        const fetchedData = await collection.find().toArray();
        await client.close();

        return res.status(200).json({
            status: true,
            message: 'Data fetched successfully',
            data: fetchedData,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ status: false, message: error.message });
    }
});



// get resume-data by id
app.get('/api/resume-data/:id', async (req, res) => {
    try {
        const id = req.params.id; // Extracting the ID from request parameters

        const client = new MongoClient(url, { useUnifiedTopology: true });

        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Convert the string ID to an ObjectId
        const fetchedData = await collection.findOne({ _id: new ObjectId(id) });
        //  const fetchedData = await collection.find().toArray();

        await client.close();

        return res.status(200).json({
            message: 'Data fetched successfully',
            data: fetchedData,
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ message: 'Error fetching data' });
    }
});


app.listen(Port, () => {
    console.log("Server running on port 5454");
});
