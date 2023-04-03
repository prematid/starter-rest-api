const express = require('express');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const bodyParser = require('body-parser');

const postServer = express();
const PORT = process.env.PORT || 3000;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Middleware
postServer.use(bodyParser.json());

// Routes
// CREATE
postServer.post('/posts', (req, res) => {
    const { title, content } = req.body;
    const id = uuid.v4();
    const params = {
        TableName: 'Posts',
        Item: {
            id,
            title,
            content
        }
    };
    dynamoDB.put(params, (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.json({ id, title, content });
        }
    });
});

// READ ALL
postServer.get('/posts', (req, res) => {
    const params = {
        TableName: 'Posts'
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
postServer.get('/posts/:id', (req, res) => {
    const params = {
        TableName: 'Posts',
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
postServer.put('/posts/:id', (req, res) => {
    const { title, content } = req.body;
    const params = {
        TableName: 'Posts',
        Key: {
            id: req.params.id
        },
        UpdateExpression: 'set #t = :t, content = :c',
        ExpressionAttributeNames: {
            '#t': 'title'
        },
        ExpressionAttributeValues: {
            ':t': title,
            ':c': content
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
postServer.delete('/posts/:id', (req, res) => {
    const params = {
        TableName: 'Posts',
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
postServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
