const Blockchain = require('./BlockChain.js');
const Block = require('./Block');
const express = require('express');
const bodyParser = require('body-parser');

// set up express app
const app = express();

// parse incoming request data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// set up database
const blockchain = new Blockchain();

// set up get endpoint
app.get('/block/:height', (req, res) => {
    blockchain.getBlock(req.params.height).then(block => {
        res.send(JSON.stringify(block));
    }).catch(error => {
        res.status(400)
            .send({
                success: 'false',
                message: 'Block failed to retrieve'
            })
    })
})

// set up post endpoint
app.post('/block', (req, res) => {
    // ceheck block data
    if (req.body.data.length != 0) {
        blockchain.addBlock(new Block(req.body.data)).then(block => {
            res.status(201).send({
                success: 'true',
                message: 'block is successfully saved',
                block
            })
        }).catch((error) => {
            res.status(400)
                .send({
                    success: 'false',
                    message: 'Error in block creation'
                })
        })

    } else {
        res.status(400)
            .send({
                success: 'false',
                message: 'Block data is required'
            })

    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});