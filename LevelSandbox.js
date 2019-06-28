// Persist data with levelDB
const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {
    constructor() {
        this.db = level(chainDB);
    }
    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.get(key, (err, value) => {
                if (err) {
                    console.log('Block ' + key + ' failed to retrieve', err);
                    reject();
                } else {
                    resolve(value);
                }
            })
        })
    }
    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.put(key, value, err => {
                if (err) {
                    console.log('Block ' + key + ' failed to save', err);
                    reject();
                } else {
                    console.log('Block ' + key + ' saved to levelDB');
                    resolve();
                }
            })
        })
    }
    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise((resolve, reject) => {
            let count = 0;
            self.db.createReadStream()
                .on('data', data => {
                    count++;
                })
                .on('error', err => {
                    console.log(err);
                    reject();
                }).on('close', () => {
                    resolve(count);
                })
        });
    }
}

module.exports = LevelSandbox;
