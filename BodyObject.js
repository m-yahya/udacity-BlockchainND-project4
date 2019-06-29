const StarClass = require("./Star.js");

// Body class
class BodyObject {
    constructor(address, star) {
        this.star = new StarClass(star);
        this.address = address;
    }
}

module.exports = BodyObject;
