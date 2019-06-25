// Block class with constructor
class Block {
    constructor(data) {
        this.hash = '';
        this.time = 0;
        this.height = 0;
        this.data = data;
        this.previousBlockHash = '';
    }
}

module.export = Block;