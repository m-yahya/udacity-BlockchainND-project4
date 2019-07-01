const hex2ascii = require("hex2ascii");
const Block = require("./Block.js");
const Blockchain = require("./Blockchain.js");
const MemPool = require("./MemPool.js");
const BodyObject = require("./BodyObject.js");

// Star controlle class
class StarController {
    constructor(app) {
        this.app = app;
        this.memPool = new MemPool();
        this.blockchain = new Blockchain();
        this.postNewBlock();
        this.requestValidation();
        this.validateRequestByWallet();
        this.getStarByIndex();
        this.getStarByHash();
        this.getStarByAddress();
    }

    // decode block
    getDecodedBlock(block) {
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
                let blockBody = {
                    'star': {
                        'ra': starToAdd.ra,
                        'dec': starToAdd.dec,
                        'mag': starToAdd.mag,
                        'cen': starToAdd.cen,
                        'story': new Buffer.from(starToAdd.story).toString('hex')
                    },
                    'address': walletAddress
                };
                let validAddress = this.memPool.isInMempoolValid(walletAddress);
                if (validAddress) {
                    let newBlock = new Block(blockBody);
                    this.blockchain.addBlock(newBlock).then(block => {
                        this.memPool.cleanMempoolValid(walletAddress);
                        res.send(this.getDecodedBlock(JSON.parse(block)));
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
                res.send(this.memPool.addRequestValidation(walletAddress));
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
            let walletAddress = req.body.address;
            let signature = req.body.signature;
            if (walletAddress && signature != undefined && typeof walletAddress && typeof signature === 'string') {
                res.send(this.memPool.validateRequestByWallet(walletAddress, signature))
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
        this.app.get('/block/:index', (req, res) => {
            this.blockchain.getBlock(req.params.index).then(star => {
                if (star == undefined) {
                    res.send({
                        success: 'false',
                        message: 'Star failed to retrieve'
                    })
                } else if (req.params.index == 0) {
                    res.send((star))
                } else {
                    res.send(this.getDecodedBlock(star));
                }
            })
        })
    }

    // get star block by hash endpoint
    getStarByHash() {
        this.app.get('/stars/hash/:hash', (req, res) => {
            let height;
            this.blockchain.getBlockHeight().then(result => {
                height = result;
            })
            this.blockchain.getBlockByHash(req.params.hash).then(star => {
                if (star === undefined) {
                    res.send({
                        success: 'false',
                        message: 'Star failed to retrieve'
                    })
                } else if (height == 0) {
                    res.send((star))
                } else {
                    res.send(this.getDecodedBlock(JSON.parse(star)));
                }
            })
        })
    }

    // get star block by hash endpoint
    getStarByAddress() {
        this.app.get('/stars/address/:address', (req, res) => {

            this.blockchain.getBlockByAddress(req.params.address).then(stars => {
                if (stars != undefined && stars.length > 0) {
                    let starByAddress = [];
                    stars.forEach(star => {
                        starByAddress.push(this.getDecodedBlock(JSON.parse(star)));
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