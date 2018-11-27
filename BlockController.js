const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockchainClass = require('./simpleChain');
const ValidationRequestClass = require('./ValidationRequest');
const MempoolClass = require('./Mempool');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.blockchain = new BlockchainClass.Blockchain();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
        //mempool for the server
        this.mempool = new MempoolClass.Mempool();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        const self = this; 
        this.server.route({
            method: 'GET',
            path: '/block/{index}',
            handler: async (request, h) => {
                let result = null;
                //this is the way hapi.js builds the response header
                //fist include the response 
                let response = null; 
                let currentHeight = await self.blockchain.getBlockHeight();
                if (request.params.index >= 1 && request.params.index <= currentHeight) {
                    result = await self.blockchain.getBlock(request.params.index);
                    response = h.response(result);
                    response.code(200);
                }
                else {

                    result = {"response": `Invalid index: ${request.params.index}`};
                    response = h.response(result);
                    response.code(400);
                }
                //set the content type to JSON so we ensure our response is recieved as JSON
                response.type('application/json; charset=ISO-8859-1');
                return response;
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        const self = this; 
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async (request, h) => {
                let result = null;
                //this is the way hapi.js builds the response header
                //fist include the response 
                let response = null; 
                if (request.payload){
                    if (request.payload.body) {
                        let currentHeight =  await self.blockchain.getBlockHeight();
                        let newBlock = new BlockClass.Block(`${request.payload.body}`);
                        newBlock.height = currentHeight;
                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                        result = await self.blockchain.addBlock(newBlock);
                        response = h.response(result);
                        response.code(201);
                    } else {
                        result = {"response": 'FAILED: Failed to add a block because request did not contain the expected body payload for the block.'};
                        response = h.response(result);
                        response.code(400); 
                    }
                } else {
                    result = {"response": 'FAILED: Failed to add a block because request did not contain any payload.'};
                    response = h.response(result);
                    response.code(400);
                }
                 
                //set the content type to JSON so we ensure our response is recieved as JSON
                response.type('application/json; charset=ISO-8859-1');
                return response;
            } 
        });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    async initializeMockData() {
        let self = this;
        let currentHeight = await this.blockchain.getBlockHeight();
        if(currentHeight === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = await self.blockchain.getBlockHeight();
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                await self.blockchain.addBlock(blockAux);
            }
        }
    }

    /**
     * Implements a POST endpoint validates request with JSON response
     *
     */
    requestValidation() {
        const self = this; 
        this.server.route({
            method: 'POST',
            path: '/requestValidation',
            handler: (request, h) => {
                let result = null; 
                let response = null; 
                if (request.payload){
                    if (request.payload.address) {
                        //first create the validation request object
                        let theValidationRequest = new ValidationRequestClass.ValidationRequest(request.payload.address);
                        let requestToBeReturned = self.mempool.addRequestValidation(theValidationRequest);
                        response = h.response(requestToBeReturned);
                        response.code(200);
                    } else {
                        result = {"response": 'FAILED: Failed to validate because request did not contain the expected address payload for the request.'};
                        response = h.response(result);
                        response.code(400); 
                    }
                } else {
                    result = {"response": 'FAILED: Failed to request validation because request did not contain any payload.'};
                    response = h.response(result);
                    response.code(400);
                }
                 
                //set the content type to JSON so we ensure our response is recieved as JSON
                response.type('application/json; charset=ISO-8859-1');
                return response;
            }
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => { return new BlockController(server);}