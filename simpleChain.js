/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
/* ===== levelSandbox with level ============================
|  This is needed to presist the data using levelDB         |
|  ========================================================*/

const db = require('./levelSandbox');

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain     |
|  ================================================*/

class Blockchain{
  constructor(){
    this.getBlockHeight().then((height) => {
      if (height === 0){
        this.addGenesisBlock().then((result) => {
          //TODO when genesis added
        }).catch((err) => {
          console.log(err);
        });
      }
    });
    
  }

  addGenesisBlock(){
    return new Promise((resolve, reject) => {
      let genesis = new BlockClass.Block("First block in the chain - Genesis block");
      genesis.time = new Date().getTime().toString().slice(0,-3);
      genesis.height = 1;
      genesis.previousBlockHash = '0x';
      genesis.hash = SHA256(JSON.stringify(genesis)).toString();
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
        // previous block hash
        this.getBlock(height).then((previousBlock) => {
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
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
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
  validateChain(){
    const self = this; 
    let errorLog = [];
    let previousBlockHash = '0x'; //for the gensis block
    this.getBlockHeight().then((height) => {
      for (let i = 1; i < height; i++) {
        // validate block
        let isValid = undefined; 
        this.validateBlock(i).then((result) => {
          isValid = result;
          //uncomment to test validatechain
          //console.log('block-'+i+" is "+isValid);
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
            previousBlockHash = theHash;
            //check the error log when checking last block in the chain!
            if (i === height-1) {
              if (errorLog.length>0) {
                console.log('Block errors = ' + errorLog.length);
                console.log('Blocks: '+errorLog);
                return false;
              } else {
                console.log('No errors detected');
                return true;
              }
            }
          })
        }); 
      }//for
    }); 
  }    
}


/*let myBlockChain = new Blockchain();
(function theLoop (i) { 
    setTimeout(function () {
        //*************uncomment to test addition of blocks to DB**********************
        let blockTest = new BlockClass.Block("Test Block - " + (i + 1));
        myBlockChain.addBlock(blockTest).then((result) => {
          //console.log("RESULT: "+result);
            i++;
            if (i < 10) theLoop(i);
        });
        

        //*************uncomment to test validate block**********************
        /*myBlockChain.validateBlock(i+1).then((result) => {
          console.log("Block-" + (i+1) + ": " + result);
          i++;
          if (i < 10) theLoop(i);
        });
        //************test validation of chain*****************************
        myBlockChain.validateChain();
    }, 1000);
  })(0);*/
  