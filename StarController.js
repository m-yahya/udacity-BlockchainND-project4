const hex2ascii = require("hex2ascii");
const BlockClass = require("./Block.js");
const BlockchainClass = require("./Blockchain.js");
const MemPoolClass = require("./MemPool.js");
const BodyObject = require("./BodyObject.js");

// Star controlle class
class StarController {
    constructor(app) {
        this.app();
        this.memPool = new MemPoolClass();
        this.blockchain = new BlockchainClass();
        this.postNewBlock();
        this.requestValidation();
        this.validateRequestByWallet();
        this.getBlockByIndex();
        this.getStarByHash();
        this.getStarByAddress();
    }

    // decode block
    getDecodedBlock(block) {
        block = JSON.parse(block);
        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
        return block;
    }

    // post block endpoint
    postNewBlock() {
        this.app.post('/block', (req, res) => {
            // verify walletAddress and contents
            let walletAddress = req.body.address;
            let starToAdd = req.body.star;

            if (walletAddress && starToAdd && starToAdd.story != undefined) {
                let body = new BodyObject(walletAddress, starToAdd);
                let validAddress = this.MemPoolClass.isInMempoolValid(walletAddress);
                if (validAddress) {
                    let newBlock = new BlockClass(body);
                    this.BlockchainClass.addBlock(newBlock).then(block => {
                        this.MemPoolClass.cleanMempoolValid(walletAddress);
                        res.send(this.getDecodedBlock(block));
                    })
                } else {
                    res.send({
                        success: 'false',
                        message: 'Request not found in valid mempool'
                    })
                }
            } else {
                res.send({
                    success: 'false',
                    message: 'Star failed to retrieve, invalid request parameters'
                })
            }
        })
    }

    // request validation endpoint
    requestValidation() {
        this.app.post('/requestValidation', (req, res) => {
            let walletAddress = req.body.address;
            if (walletAddress != undefined && typeof walletAddress === 'string') {
                res.send(this.MemPoolClass.addRequestValidation(walletAddress));
            } else {
                res.send({
                    success: 'false',
                    message: 'Validation request is invalid'
                })
            }
        })
    }

    // validate request by wallet endpoint
    validateRequestByWallet() {
        this.app.post('/message-signature/validate', (req, res) => {
            let walletAddress = req.body.walletAddress;
            let signature = req.body.signature;
            if (walletAddress && signature != undefined && typeof walletAddress && typeof signature === 'string') {
                res.send(this.MemPoolClass.validateRequestByWallet(walletAddress, signature))
            } else {
                res.send({
                    success: 'false',
                    message: 'Validation request is invalid'
                })
            }
        })
    }

    // get star block by index endpoint
    getStarByIndex() {
        this.app.get('/stars/index:index', (req, res) => {
            this.blockchain.getBlock(req.params.index).then(star => {
                if (star == undefined) {
                    res.send({
                        success: 'false',
                        message: 'Star failed to retrieve'
                    })
                } else {
                    res.send(this.getDecodedBlock(star))
                }
            })
        })
    }

    // get star block by hash endpoint
    getStarByHash() {
        this.app.get('/stars/hash:hash', (req, res) => {
            this.blockchain.getBlockByHash(req.params.hash).then(star => {
                if (star == undefined) {
                    res.send({
                        success: 'false',
                        message: 'Star failed to retrieve'
                    })
                } else {
                    res.send(this.getDecodedBlock(star))
                }
            })
        })
    }

    // get star block by hash endpoint
    getStarByAddress() {
        this.app.get('/stars/address:address', (req, res) => {

            this.blockchain.getBlockByAddress(req.params.address).then(stars => {
                if (stars != undefined && stars.length > 0) {
                    let starByAddress = [];
                    stars.forEach(start => {
                        starByAddress.push(this.getDecodedBlock(star));
                    });
                    res.send(starByAddress);
                } else {
                    res.send({
                        success: 'false',
                        message: 'No star block for the address'
                    })
                }
            })
        })
    }
}

module.exports = app => {
    return new StarController(app);
};