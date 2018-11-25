# Private Blockchain Data API

## Introduction
Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing a simplified private blockchain. Keeping the block held privately might have its own usages but being able to share it accross multiple platform will add greater value to the blockchain. To do this the blockchain should be able to recieve and send data using a simple method which is an API (Application Programming Interface) this will enable our blockchain to be integrated with web, mobile, and IoT devices. 

## Project Architecture
This project includes the blockchain essential classes which are: ```Block.js``` and```simpleChain.js``` in addition to the backend level database served by the class ```levelSandbox.js```. The server that will serve the API requests from the blockchain is built on ```hapi.js``` which is a ```node.js``` framework. Server initialization is included in ```app.js``` and the interaction with the private blockchain is implemented through ```BlockController.js```. 

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

## Node.js Hapi Framework
More info about hapi frame work that was utilized to build the API can be found on <https://hapijs.com/>.
