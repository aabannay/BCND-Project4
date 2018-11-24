# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing a simplified private blockchain. Keeping the block held privately might have its own usages but being able to share it accross multiple platform will add greater value to the blockchain. To do this the blockchain should be able to recieve and send data using a simple method which is an API (Application Programming Interface) this will enable our blockchain to be integrated with web, mobile, and IoT devices. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

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

- Install Hapi with --save flag
```
npm install hapi --save
```
## Testing

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```

# Endpoint Documentation 
## Using the API 

### To GET a particular block
a block can be requested using http GET request from the following link: 
<http://localhost:8000/block/index>

where index is the height of the requested block
N.B. requested a block with negative, 0, or out of bound index will result in an error message. 

### To POST a new block
A new block can be created using http POST request with payload of the formate: 

```
{
	"body": "the new block that will be created body should be here"
}
```
and the link is: 
<http://localhost:8000/block>

# Node.js Hapi Framework
More info about hapi frame work that was utilized to build the API can be found on <https://hapijs.com/>.
