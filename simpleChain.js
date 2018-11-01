/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

/* ===== levelSandbox with level ============================
|  This is needed to presist the data using levelDB         |
|  ========================================================*/

const db = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block             |
|  ===============================================*/

class Block{
  constructor(data){
     this.hash = '',
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ''    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain     |
|  ================================================*/

class Blockchain{
  constructor(){
    console.log('new blockchain created');
    //this.chain = [];
    //this.addBlock(new Block("First block in the chain - Genesis block"));
    this.getBlockHeight().then((height) => {
      if (height === 0){
        this.addGenesisBlock().then((result) => {
          console.log("Genesis Block added: " + result);
        }).catch((err) => {
          console.log(err);
        });
      }
    });
    
  }

  addGenesisBlock(){
    return new Promise((resolve, reject) => {
      console.log('inside genesis block');
      let genesis = new Block("Genesis Block");
      genesis.time = new Date().getTime().toString().slice(0,-3);
      genesis.height = 1;
      genesis.previousBlockHash = '0x';
      genesis.hash = SHA256(JSON.stringify(genesis)).toString();
      console.log('genesis height is: ' + genesis.height);
      db.addLevelDBData(genesis.height, JSON.stringify(genesis).toString())
        .then((result) => {
          console.log("added data: " + result.toString());
          resolve(result);
        }).catch((err) => {
          console.log("Error in addiing to database", err);
          reject(err);
        });
    });
  }
  // Add new block
  addBlock(newBlock){
    // Adding block object to chain
    const self = this;
    return new Promise ((resolve, reject) => {
      this.getBlockHeight().then((height) => {
        newBlock.height = height + 1;
        console.log(height + " is the current height");
        // previous block hash
        this.getBlock(height).then((previousBlock) => {
          //console.log("inside getBlock; previousBlock: " + previousBlock);
          // UTC timestamp
          newBlock.time = new Date().getTime().toString().slice(0,-3);
          newBlock.previousBlockHash = JSON.parse(previousBlock).hash;
          // Block hash with SHA256 using newBlock and converting to a string
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
            .then((result) => {
              console.log("added data: " + result.toString());
              resolve(result);
            }).catch((err) => {
              console.log("Error in addiing to database", err);
              reject(err);
            });
        }).catch((err) => {
          console.log("Error in getting previous block!", err);
        });
      }).catch((err) => {
        console.log("Error in getting block height!", err);
      });
    }); 
  }

  // Get block height
  getBlockHeight(){
    let self = this; 
    return new Promise((resolve, reject) => {
      db.getBlocksCount().then((result) => {
        //console.log('block count: ' + result);
        resolve(JSON.parse(result));

      });
    });
  }

    // get block
  getBlock(blockHeight){
    // return object as a single string
    //return JSON.parse(JSON.stringify(this.chain[blockHeight]));
    let self = this;
    return new Promise((resolve, reject) => {
          db.getLevelDBData(blockHeight).then((value) => {
              resolve(value);
          }).catch((err) => {
              console.log("Error in getting the block requisted with height" + blockHeight);
          })
      });
  }

    // validate block
  validateBlock(blockHeight){
    // get block object
    return new Promise((resolve, reject) => {
      this.getBlock(blockHeight).then((result) => {
        let block = JSON.parse(result);
        // get block hash
        let blockHash = block.hash;
        console.log("blockHash: " + blockHash);
        // remove block hash to test block integrity
        block.hash = '';
        //set time to 0 if this is the Genesis Block (so it validate)
        //if (blockHeight == 0)
        //block.time = 0; 
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        console.log('compared with: ' + validBlockHash);
        // Compare
        if (blockHash===validBlockHash) {
            resolve(true);
        } else {
            console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            reject(false);
        }
      });
    });   
  }

 // Validate blockchain
  async validateChain(){
    const self = this; 
    let errorLog = [];
    let previousBlockHash = '0x'; //for the gensis block
    this.getBlockHeight().then((height) => {
      for (let i = 1; i < height; i++) {
        // validate block
        let isValid = undefined; 
          this.validateBlock(i).then((result) => {
            isValid = result;
            console.log('block-'+i+" is "+isValid);
          if (!isValid)
            errorLog.push(i);
          //compare link between two blocks
          //this is done by checking the previous hash within this block and if it matches
          //the hash of the previous block (genesis block is a special case).
          this.getBlock(i).then((block) => {
            let theHash = JSON.parse(block).hash;
            let currentBlockPreviousHash = JSON.parse(block).previousBlockHash;
            if (currentBlockPreviousHash!==previousBlockHash) {
              errorLog.push(i);
            }
            console.log("XXXcurrent block previous hash: " + currentBlockPreviousHash);
            console.log("XXXprevious block hash: " + previousBlockHash);
            previousBlockHash = theHash;
            //check the error log when checking last block in the chain!
            if (i === height-1) {
              if (errorLog.length>0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: '+errorLog);
              } else {
                console.log('No errors detected');
              }
            }
          })
          });
          
      }//for
    }); 
  }

  //this function will return the hash of the block with the given height.
   getBlockHash(height) {
    return new Promise((resolve,reject) => {
       this.getBlock(height).then((block) => {
        let theHash = JSON.parse(block).hash;
        //console.log(theHash);
        return theHash;
      });
    });
  }
  //this function will return the hash of the previous block to the block with the given height
  getPreviousHash(height) {
    return new Promise((resolve, reject) => {
      this.getBlock(height).then((block) => {
        let thePreviousBlockHash = JSON.parse(block).previousBlockHash;
        resolve(thePreviousBlockHash);
      });
    });
  }     
}


let myBlockChain = new Blockchain();
(function theLoop (i) { 
    setTimeout(function () {
        /*let blockTest = new Block("Test Block - " + (i + 1));
        myBlockChain.addBlock(blockTest).then((result) => {
          //console.log("RESULT: "+result);
            i++;
            if (i < 10) theLoop(i);
        });
        */
        /*myBlockChain.validateBlock(i+1).then((result) => {
          console.log("Block-" + (i+1) + ": " + result);
          i++;
          if (i < 10) theLoop(i);
        });*/
        myBlockChain.validateChain();
    }, 0);
  })(0);