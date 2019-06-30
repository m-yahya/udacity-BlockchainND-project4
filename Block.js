// Block class with constructor
class Block {
    constructor(data) {
        this.hash = '';
        this.time = 0;
        this.height = 0;
        this.body = data;
        this.previousBlockHash = '';
    }
}

module.exports = Block;