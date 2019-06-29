// Blockchain class with constructor
const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {
    constructor() {
        this.bd = new LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    generateGenesisBlock() {
        this.getBlockHeight().then(height => {
            if (height === -1) {
                return this.addBlock(new Block('First block in the chain - Genesis block'));
            }
        })
    }
    // Get block height, it is a helper method that return the height of the blockchain
    async getBlockHeight() {
        return await this.bd.getBlocksCount() - 1;
    }
    // Add new block
    async addBlock(block) {
        // block hash
        block.hash = SHA256(JSON.stringify(block).toString());
        // UTC timestamp
        block.time = new Date().getTime().toString().slice(0, -3);
        // block height
        const height = parseInt(await this.getBlockHeight());
        block.height = height + 1;
        // previous block hash
        if (block.height > 0) {
            const previousBlock = await this.getBlockHeight(height);
            block.previousBlockHash = previousBlock.hash;
        }
        // add block
        await this.bd.addLevelDBData(block.height, JSON.stringify(block));

        // return the new block
        return JSON.stringify(block);
    }
    // Get Block By Height
    async getBlock(height) {
        return JSON.parse(await this.bd.getLevelDBData(height));
    }

    // get block by hash
    async getBlockByHash(hash) {
        return JSON.parse(await this.bd.getBlockByHash(hash));
    }

    // get blocks by address
    async getBlockByAddress(address) {
        return await this.bd.getBlocksByAddress(address);
    }
    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        return new Promise((resolve, reject) => {
            // get block
            let block = this.getBlock(height);
            // get block hash
            let blockHash = block.hash;
            // remove block hash for test
            block.hash = '';
            // create valid hash
            let validBlockHash = SHA256(JSON.stringify(block));
            // comparison
            if (blockHash === validBlockHash) {
                resolve(true);
            } else {
                console.log('Block No. ' + height + ' invalid hash:\n' + blockHash + '-' + validBlockHash);
                resolve(false);
            }
        })
    }
    // Validate Blockchain
    async validateChain() {
        let errorLog = [];
        const blockHeight = await this.getBlockHeight();
        for (var i = 0; i < blockHeight; i++) {
            // check block validation
            if (!this.validateBlock(i)) {
                errorLog.push(i);
            }

            // compare block hashes
            let block = this.getBlock(i);
            let blockHash = block.hash;
            let nextBlock = await this.getBlock(i + 1);
            let previousHash = nextBlock.previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }

        if (errorLog.length > 0) {
            console.log('Total errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No error found');
        }
    }
}
module.exports = Blockchain;

