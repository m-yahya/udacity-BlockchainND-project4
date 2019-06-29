// Star class
class Star {
    constructor(star) {
        this.ra = star.ra;
        this.dec = star.dec;
        this.mag = star.mag;
        this.cen = star.cen;
        this.story = new Buffer.from(star.story).toString('hex');
    }
}

module.exports = Star;