

const TimeoutRequestsWindowTime = 5 * 60 * 1000;
// MemPool class to hold the validation requests
class MemPool {
    constructor() {
        this.mempool = [];
        this.timeoutRequests = [];
    }

    // get current timestamp
    getCurrentTimestamp() {
        return new Date().getTime().toString().slice(0, -3);
    }

    // check if request alread exists
    isInMempool(walletAddress) {
        if (this.mempool[walletAddress] != undefined) {
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
    }

    // remove validation request
    removeValidationRequest(walletAddress) {
        delete this.timeoutRequests[walletAddress];
        if (this.mempool[walletAddress] != undefined) {
            delete this.mempool[walletAddress];
        }
    }

}

// let test = new MemPool();
// let counter = 0;
// setInterval(function () {
//     console.log(test.addRequestValidation('fjsdkla'));
//     console.log(test.mempool['fjsdkla']);
//     counter++;
// }, 10000);

