const express = require('express');
const bodyParser = require('body-parser');

// Star REST API class
class StarAPI {
    constructor() {
        // set up express app
        this.app = express();
        this.initExpressMiddleWares();
        this.initStarControllers();
        this.runServer();
    }

    // parse incoming request data
    initExpressMiddleWares() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    // init all endpoints
    initStarControllers() {
        require("./StarController")(this.app);
    }

    // run server
    runServer() {
        const PORT = 8000;
        this.app.listen(PORT, () => {
            console.log(`server is running on port ${PORT}`);
        });
    }

}
new StarAPI();