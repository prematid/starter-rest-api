const express = require('express');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const bodyParser = require('body-parser');

const usersAPI = express();
const PORT = process.env.PORT || 3000;
const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1', // replace with the region where your DynamoDB instance is hosted
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // replace with your access key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // replace with your secret access key
    endpoint: 'https://dynamodb.us-east-1.amazonaws.com' // replace with the endpoint of your DynamoDB instance
});

// Middleware
usersAPI.use(bodyParser.json());

// Routes
// CREATE
usersAPI.post('/users', (req, res) => {
    const { name, email, age } = req.body;
    const id = uuid.v4();
    const params = {
        TableName: 'Users',
        Item: {
            id,
            name,
            email,
            age
        }
    };
    dynamoDB.put(params, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.json({ id, name, email, age });
        }
    });
});

// READ ALL
usersAPI.get('/users', (req, res) => {
    const params = {
        TableName: 'Users'
    };
    dynamoDB.scan(params, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.json(data.Items);
        }
    });
});

// READ ONE
usersAPI.get('/users/:id', (req, res) => {
    const params = {
        TableName: 'Users',
        Key: {
            id: req.params.id
        }
    };
    dynamoDB.get(params, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.json(data.Item);
        }
    });
});

// UPDATE
usersAPI.put('/users/:id', (req, res) => {
    const { name, email, age } = req.body;
    const params = {
        TableName: 'Users',
        Key: {
            id: req.params.id
        },
        UpdateExpression: 'set #n = :n, email = :e, age = :a',
        ExpressionAttributeNames: {
            '#n': 'name'
        },
        ExpressionAttributeValues: {
            ':n': name,
            ':e': email,
            ':a': age
        },
        ReturnValues: 'ALL_NEW'
    };
    dynamoDB.update(params, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.json(data.Attributes);
        }
    });
});

// DELETE
usersAPI.delete('/users/:id', (req, res) => {
    const params = {
        TableName: 'Users',
        Key: {
            id: req.params.id
        }
    };
    dynamoDB.delete(params, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.sendStatus(204);
        }
    });
});

// Start server
usersAPI.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
