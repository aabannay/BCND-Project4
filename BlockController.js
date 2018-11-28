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
        //mempool for the server
        this.mempool = new MempoolClass.Mempool();
        //methods
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
        this.validateMessageSignature();
        this.getBlockByHash();
        this.getBlockByWalletAddress();
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
                    if (request.payload.address) {
                        if (request.payload.star) {
                            //ensure the star element is not an array
                            if ( Object.prototype.toString.call(request.payload.star) === '[object Array]') {
                                result = {"response": 'FAILED: Failed to add a block because request contained an array of stars. Expected only one star element'};
                                response = h.response(result);
                                response.code(400);
                            } else {
                                //check expected ESSENTIAL properties of star exist in the pay load
                                if (request.payload.star.dec &&
                                    request.payload.star.ra &&
                                    request.payload.star.story) {
                                        //now check if the request validation exist and valid
                                        let isValid = this.mempool.verifyAddressRequest(request.payload.address);
                                        if (isValid) {
                                            let RA = request.payload.star.ra;
                                            let DEC = request.payload.star.dec;
                                            let MAG = '';
                                            if (request.payload.star.mag) {
                                                MAG = request.payload.star.mag;
                                            }
                                            let CEN = '';
                                            if (request.payload.star.cen) {
                                                CEN = request.payload.star.cen;
                                            }
                                            let body = {
                                                address: request.payload.address,
                                                star: {
                                                      ra: RA,
                                                      dec: DEC,
                                                      mag: MAG,
                                                      cen: CEN,
                                                      story: Buffer(request.payload.star.story).toString('hex')
                                                      } 
                                                };
                                            let currentHeight =  await self.blockchain.getBlockHeight();
                                            let newBlock = new BlockClass.Block(body);
                                            newBlock.height = currentHeight;
                                            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                                            result = await self.blockchain.addBlock(newBlock);
                                            //add the decoded story to the block before returning it: 
                                            //first get the encoded story
                                            let resultJSON = JSON.parse(result)
                                            let encodedStory = resultJSON.body.star.story;
                                            //create encoding buffer reading hex
                                            let decodeBuffer = new Buffer(encodedStory, 'hex');
                                            //convert from buffer to ascii
                                            let decodedStory = decodeBuffer.toString('ascii');
                                            //now add the decoded story 
                                            resultJSON.body.star.storyDecoded = decodedStory; 
                                            response = h.response(resultJSON);
                                            response.code(201);
                                        } else {
                                            result = {"response": 'FAILED: Failed to add a block because request failed to obtain request validation either due to timeout or validation does not exist'};
                                            response = h.response(result);
                                            response.code(400);
                                        }
                                        
                                } else {
                                    result = {"response": 'FAILED: Failed to add a block because request did not contain star essential payload i.e. dec, ra, and story'};
                                    response = h.response(result);
                                    response.code(400);
                                }
                            }
                        } else {
                            result = {"response": 'FAILED: Failed to add a block because request did not contain the expected star payload for the block.'};
                            response = h.response(result);
                            response.code(400);
                        }
                    } else {
                        result = {"response": 'FAILED: Failed to add a block because request did not contain the expected address payload for the block.'};
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

    //get block by hash 
    getBlockByHash() {
        const self = this; 
        this.server.route({
            method: 'GET',
            path: '/stars/hash:{hashValue}',
            handler: async (request, h) => {
                let result = null;
                //this is the way hapi.js builds the response header
                //fist include the response 
                let response = null;
                let block = null;  
                block = await self.blockchain.getBlockByHash(request.params.hashValue);
                if (block) {
                    response = h.response(block);
                    response.code(200);
                }
                else {
                    result = {"response": `No block was found with given hash: ${request.params.hashValue}`};
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
                        let code = null; 
                        if (self.mempool.mempool[request.payload.address]) {
                            code = 200; 
                        } else {
                            //response with code 201 to show that object was created.
                            code = 201;
                        }
                        //first create the validation request object
                        let theValidationRequest = new ValidationRequestClass.ValidationRequest(request.payload.address);
                        let requestToBeReturned = self.mempool.addRequestValidation(theValidationRequest);
                        response = h.response(requestToBeReturned);
                        response.code(code);
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

    /**
     * Implements a POST endpoint to validate message signature and respond with JSON response
     * The request should provide the address to validate the signature provided for the stored message.
     */
    validateMessageSignature() {
        const self = this; 
        this.server.route({
            method: 'POST',
            path: '/message-signature/validate',
            handler: (request, h) => {
                let result = null; 
                let response = null; 
                if (request.payload){
                    if (request.payload.address) {
                        if (request.payload.signature) {
                            let validationResponse = self.mempool.validateRequestByWallet(request.payload.address, request.payload.signature);
                            if (validationResponse.isValid) {
                                console.log(validationResponse.isValid);
                                result = self.mempool.mempoolValid[request.payload.address];
                                //clean timeout array before returning validation object
                                self.mempool.removeTimeoutRequest(request.payload.address);
                                response = h.response(result);
                                response.code(201);
                            } else {
                                console.log(validationResponse.isValid);
                                result = {"response": `FAILED: Failed to validate signature with message. Reason: ${validationResponse.reason}`};
                                response = h.response(result);
                                response.code(400);
                                console.log(result);
                            }
                            
                        } else {
                            result = {"response": 'FAILED: Failed to validate because request did not contain the expected signature payload for the request.'}
                        }
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

    getBlockByWalletAddress() {
        const self = this; 
        this.server.route({
            method: 'GET',
            path: '/stars/address:{addressValue}',
            handler: async (request, h) => {
                let result = null;
                //this is the way hapi.js builds the response header
                //fist include the response 
                let response = null;
                let blocks = null;  
                blocks = await self.blockchain.getBlockByWalletAddress(request.params.addressValue);
                //console.log('type inside bcnt after parsing: ' + typeof(blocks));
                if (blocks.length > 0) {
                    //decode the story here 
                    for (let i=0; i < blocks.length; i++) {
                        //convert the block to JSON to access its properties. 
                        blocks[i] = JSON.parse(blocks[i])
                        let encodedStory = blocks[i].body.star.story;
                        //create encoding buffer reading hex
                        let decodeBuffer = new Buffer(encodedStory, 'hex');
                        //convert from buffer to ascii
                        let decodedStory = decodeBuffer.toString('ascii');
                        //now add the decoded story 
                        blocks[i].body.star.storyDecoded = decodedStory; 
                    }
                    response = h.response(blocks);
                    response.code(200);
                }
                else {
                    result = {"response": `No block was found with given wallet address: ${request.params.addressValue}`};
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