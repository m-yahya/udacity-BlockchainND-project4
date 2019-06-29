# Build a Private Blockchain Notary Service
## Udacity Blockchain Developer Nanodegree - Project 4

In Project 3: Connect Private Blockchain to Front-End Client via APIs, we solved the challenge of how to connect our private blockchain to front-end client via APIs. The next challenge is to build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky.

The current project is based on the Blockchain dataset created in [Project 2 and 3](https://github.com/m-yahya/udacity-BlockchainND-project2). In addition, a `MemPool` component is created to store temporal validation requests for 5 minutes. In order to interact with the application, following endpoints are created using [Express.js](https://expressjs.com/) framework:

* POST requestValidation
* POST message-signature/validate
* POST block
* GET stars/index:index
* GET stars/hash:hash
* GET stars/address:address

## Setup project

To setup the project do the following:
1. Download the project.
2. Run command `npm install` to install the project dependencies.

## Run the project

The file __app.js__ in the root directory has all the code to be able to run the project. In the root directory run the command `node app.js`

## Test the project

The project can be tested either using [Postman](https://www.getpostman.com/) or [Curl](https://curl.haxx.se/).

*Get Block endpoint*
```
http:localhost:8000/block/[blockHeight]
```
Curl example:
Type the following command in the terminal:
```
curl http:localhost:8000/block/0
```
Postman example:
Type the following command in the __Postman__ and select __Get__ option:
```
http:localhost:8000/block/0
```
*Post Block endpoint*

```
http://localhost:8000/block
```

Curl example:
```
curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json' \
     -d $'{
  "body": "Testing block with test string data"
}'
```

Postman example:
Type the following command in the __Postman__ and select __Post__ option and add *data* parameter in *body*:
```
http:localhost:8000/block
```