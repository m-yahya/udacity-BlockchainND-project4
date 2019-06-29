const bitcoinMessage = require('bitcoinjs-message');

const TimeoutRequestsWindowTime = 5 * 60 * 1000;
// MemPool class to hold the validation requests
class MemPool {
    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
    }

    // get current timestamp
    getCurrentTimestamp() {
        return new Date().getTime().toString().slice(0, -3);
    }

    // check if request alread exists in mempool
    isInMempool(walletAddress) {
        if (this.mempool[walletAddress] != undefined) {
            return true;
        } else {
            return false;
        }
    }

    // check if request alread exists in mempoolValid
    isInMempoolValid(walletAddress) {
        if (this.mempoolValid[walletAddress] != undefined) {
            return true;
        } else {
            return false;
        }
    }

    // set window validation time
    setValidationWindowTime(req, timeElapse) {
        let timeLeft = (TimeoutRequestsWindowTime / 1000) - timeElapse;
        req.validationWindow = timeLeft;
    }

    // method to add requests to mempool
    addRequestValidation(walletAddress) {
        let requestObject = {}

        // check if request is already a part of mempool
        if (!this.isInMempool(walletAddress)) {
            requestObject.walletAddress = walletAddress;
            requestObject.requestTimestamp = this.getCurrentTimestamp();
            requestObject.message = requestObject.walletAddress + ':' + requestObject.requestTimestamp + ':starRegistry';
            requestObject.validationWindow = TimeoutRequestsWindowTime / 1000;

            // add request to the mempool
            this.mempool[walletAddress] = requestObject;

            // set time out for the request validation
            this.timeoutRequests[walletAddress] = setTimeout(() => {
                this.removeValidationRequest(walletAddress);
            }, TimeoutRequestsWindowTime);

        } else {
            this.updateValidationWindow(walletAddress);
        }
        // return the request object with following values
        return this.mempool[walletAddress];
    }

    // update validation window time
    updateValidationWindow(walletAddress) {
        let timeElapse = this.getCurrentTimestamp() - this.mempool[walletAddress].requestTimestamp;
        let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;
        this.mempool[walletAddress].validationWindow = timeLeft;
        return timeLeft;
    }

    // remove validation request
    removeValidationRequest(walletAddress) {
        delete this.timeoutRequests[walletAddress];
        if (this.mempool[walletAddress] != undefined) {
            delete this.mempool[walletAddress];
        }
    }

    // remove address from mempoolValid
    cleanMempoolValid(walletAddress) {
        if (this.mempoolValid[walletAddress] != undefined) {
            delete this.mempoolValid[walletAddress];
        }
    }

    // validate request by wallet
    validateRequestByWallet(walletAddress, signature) {
        let response = {};
        let requestObject = this.mempool[walletAddress];

        // check if request is valid
        if (requestObject === undefined) {
            response.message = 'Invalid validate request';
            return response;
        } else {
            // verify window time
            let windowTime = this.updateValidationWindow(walletAddress);
            if (windowTime > 0) {
                // verify signature
                let isValid = bitcoinMessage.verify(requestObject.message, walletAddress, signature);
                // add to mempool valid
                if (isValid) {
                    // check validation request already exists
                    if (!this.isInMempoolValid(walletAddress)) {
                        requestObject.messageSignature = true;
                        response.status = requestObject;
                        response.status.address = requestObject.walletAddress;
                        delete response.status.walletAddress;
                        response.registerStar = true;
                        // add to mempoolvalid
                        this.mempoolValid[walletAddress] = response;
                    }
                    return this.mempoolValid[walletAddress];
                } else {
                    response.message = 'Invalid signature';
                    return response;
                }
            } else {
                response.message = 'Validation window is expired, add new validation request!';
                return response;
            }

        }
    }


}

module.exports = MemPool;



