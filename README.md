# Star Blockchain API

## Introduction
Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing a simplified private blockchain. Keeping the block held privately might have its own usages but being able to share it accross multiple platform will add greater value to the blockchain. To do this the blockchain should be able to recieve and send data using a simple method which is an API (Application Programming Interface) this will enable our blockchain to be integrated with web, mobile, and IoT devices. 

## Star Data
This blockchain will be used to store star data within the body of a block. A user can add stars to the blockchain by providing a wallet address and signing a message issued by the API. This works as follows: 
1. User issues a request for Validation Request using his wallet address
2. Validation Request then is created asking the user to sign a message
3. User signs the message to prove the wallet address is his/her by signing the provided message in step 2.
4. User then is granted access to add block with star data provided by him/her.
5. Blocks added can be accessed by wallet address, hash, and block height. 

Each API endpoint will be explain in the API endpoints below. 

## Project Architecture
This project includes the blockchain essential classes which are: ```Block.js``` and```simpleChain.js``` in addition to the backend level database served by the class ```levelSandbox.js```. The server that will serve the API requests from the blockchain is built on ```hapi.js``` which is a ```node.js``` framework. Server initialization is included in ```app.js``` and the interaction with the private blockchain is implemented through ```BlockController.js```. 
Below are the additions for the Project to support stars addition to the blockchain: 
1. ```Mempool.js``` used to obtain the validation request and to validate wallet address provided for star addition to the blockchain. 
2. ```ValidationRequest.js``` class for issuing a validation request to validate a wallet address.
3. ```ValidRequest.js``` class for obtaining a valid request after validation request is validated.

In addition original classes were updated to enable the new functionalities and endpoints.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
First, you will need to clone this project using: 
```
git clone https://github.com/aabannay/BCND-Project3.git
```
Then, you will need to install Node and NPM which is pretty straightforward using the installer package available from the  [Node.js web site](https://nodejs.org/en/).

### Configuring your project
- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

- Install Hapi with --save flag **IT MUST BE VERSION 17**
```
npm install --save hapi@17.x.x
```
- Install bitcoinjs-lib
```
npm install --save bitcoinjs-lib
```
- Install bitcoinjs-message
```
npm install --save bitcoinjs-message
```
- Install body-parser
```
npm install --save body-parser
```
- Install hex2ascii
```
npm install --save hex2ascii
```

### Server Deployment and startup
After installing node and installing all the required project dependancies, you can fireup the server locally using: 
```
node app.js
```
After deploying the server then requests can be made on the server using your favourite tool. The server will respond with JSON response. See [ _Testing API_](#testing-endpoint) below. 
Starting up the server for the first time will create the required database and initialize it with 10 mockup blocks. The test requests can be performed on this mockup blocks. 
## Testing Private Blockchain with level DB
To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```javascript
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```javascript
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```javascript
blockchain.validateChain();
```
7: Induce errors by changing block data
```javascript 
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```javascript 
blockchain.validateChain();
```
## Testing Endpoint
- ### Request Block
A block can be requested using HTTP *GET* request from the following link: <http://localhost:8000/block/HEIGHT>
where HEIGHT is the height of the requested block

You can make an HTTP GET request using cURL as below: 
```curl
curl -X GET \
  http://localhost:8000/block/1000 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache'
```
The expected response from HTTP GET is a block in JSON format. For example, when requesting a block with height that is available within the blockchain a response with HTTP status code of 200 will be recieved such as below  
```JSON
{
    "hash": "8f8f0a351a84dc18d7cd31197c7fad60bfac212b556f093104ae969ce211a3ac",
    "height": 10,
    "body": "Test Data #8",
    "time": "1543153607",
    "previousBlockHash": "9c26572277b2c33a1782099bb0ca3d3bbe6e9fd85a84e2548478f802eb15f3d6"
}
```
N.B. requested a block with negative, 0, or out of bound index will result in an error message. 
If the user requested out of index (wrong height) block JSON with error message will be shared. For example, requestion block with height 1000 will result in response with 400 status code: 
```json
{
    "response": "Invalid index: 1000"
}
```
- ### ADD Block
A new block can be created using http POST request on URL: <http://localhost:8000/block> with payload of the formate: 
```JSON
{
  "body": "the new block that will be created body should be here"
}
```

A post request using cURL is as below: 
```curl 
curl -X POST \
  http://localhost:8000/block \
  -H 'Content-Type: application/json' \
  -d '{"body":"test block body to be included"}'
```
The expected response when the post succeed is 201 Created response with the created block in JSON. For example, requesting post with payload:
```json
{"body":"test stuff"}
```
Will result in the below response: 
```json
{
    "hash": "f3057c4191696dbaaafac4aee5aad76f7fb58aac1041d23fe16e2575e80a884d",
    "height": 23,
    "body": "test stuff",
    "time": "1543164413",
    "previousBlockHash": "0c03cb06af66bda41220e4da0bf78ec406fb64978cf5865ed719cbefa467c61b"
}
```
If the post request was empty, a response with 400 error code with the JSON response below will be shared: 
```json
{
    "response": "FAILED: Failed to add a block because request did not contain any payload."
}
```
Also, if there is a payload but body was not found within payload another error with status code 400 will be shared as below: 
```json
{
    "response": "FAILED: Failed to add a block because request did not contain the expected body payload for the block."
}
```
## Testing & Using Star Endpoints
- ### Sumbit a validation request 
To submit a validation request, user needs to make an HTTP POST request with the following parameters with URL: <http://localhost:8000/requestValidation>
```cURL
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}'
```
The expected response is 
```json 
{
    "walletAddress": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF",
    "requestTimeStamp": "1543445605",
    "message": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF:1543445605:starRegistry",
    "validationWindow": 300
}
```
Otherwise, user will get an error with the appropriate message. 

- ### Validate Validation Request
To validate a validation request user should make an HTTP POST request with the following parameters with URL: <http://localhost:8000/message-signature/validate>
```cURL
curl -X POST \
  http://localhost:8000/message-signature/validate HTTP/1.1 \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{
"address":"15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF",
 "signature":"HwzX2OBu+VniXYyLuPqXd8j8AOksqXnN0kF34j0VmdKjaJ2RsKMpQyMoX1dpDQjQo8SUsJoA9ezVe5dXHC9IhFc="
 }
```
Where signature payload is the resulting signature from signing the message provided from submiting the validation request earlier i.e. message:
```json
{"message": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF:1543445605:starRegistry"}
```
and the signature is from signing the message with the wallet of the address provided. 
Any error in the request will be provided accordingly. 
The expected response if the wallet was validated is as below: 
```json
{
    "registerStar": true,
    "status": {
        "address": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF",
        "requestTimeStamp": "1543445605",
        "message": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF:1543445605:starRegistry",
        "validationWindow": 266,
        "messageSignature": true
    }
}
```
- ### Adding a star to the blockchain
A star can be added to the blockchain by submitting a HTTP POST request to the URL: <http://localhost:8000/block> with the following payload: 
```json
{
"address": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF",
    "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "mag": "", 
            "cen": "",
            "story": "Found star using https://www.google.com/sky/"
        }
}
```

where address is the wallet address of the wallet that was validated and the star contains the coordinates of the star. Story is a text story of the story behind the Star story supports ASCII text, limited to 250 words (500 bytes), and hex encoded. 
If the star is added successfully to the blockchain, it will recieve the following JSON object: 
```json
{
    "hash": "a06cd93f75e2f79ccb24efed7a19e0346d2ad70a525f8a58a62aa27ae946d779",
    "height": 19,
    "body": {
        "address": "15QVhnfSb2SFszXFF5Sy4LLi9fUSDz7zQF",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68Â° 52' 56.9",
            "mag": "",
            "cen": "",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1543445642",
    "previousBlockHash": "4ac0f41bf15bc666bc8c4f4536a671d3f39409cc034db15a21a47f318c32b7b2"
}
```
Errors will be provided to the user if any. 

 - ### Request block by height
A particular star block can be requested using height by submitting an HTTP GET request to <http://localhost:8000/stars/HEIGHT> where height is the block height of the required block. 
the response is a block JSON object. Any error, will be provided to the user. 
N.B. height is a positive integer that is greater than 0. 

- ### Request block by hash 
A particular star block can also be requested by its hash. This is done by submitting an HTTP GET request to <http://localhost:8000/stars/hash:{hashValue}> where hash value is the required hash for the block (without curly brackets). The returned value is a block JSON object. If the request went through an identified error, it will provided for the user. 

- ### Request blocks by wallet address
Blocks that were posted to the block chain can be requested by submitting an HTTP GET request to the URL <http://localhost:8000/stars/address:{walletAddress}> where walletAddress is the wallet address that was used to post the stars to the blockchain. This request will return an array of blocks if there any posted with the address provided within the request. 

## Node.js Hapi Framework
More info about hapi frame work that was utilized to build the API can be found on <https://hapijs.com/>.
