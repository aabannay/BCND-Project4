/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  return new Promise((resolve, reject) => {
    db.put(key, value, (err) => {
      if (err) {
        console.log('Block ' + key + ' submission failed', err);
        reject(err);
      }
      resolve(value);
    });
  });
}
module.exports.addLevelDBData = addLevelDBData;

// Get data from levelDB with key
function getLevelDBData(key){
  console.log('inside getLevelDBData with key: ' + key);
  return new Promise((resolve, reject) => {
    db.get(key, function (err, value) {
      if (err) reject(err);/*{
        if(err.type == 'notFoundError') {
          console.log("ERROR UNDEFINED");
          resolve(undefined);
        } else {
          console.log('Not found!', err);
          reject(err);
        }
      } */
        console.log('resolved');
        console.log(value);
        resolve(value);
      
    })
  });
}
module.exports.getLevelDBData = getLevelDBData;

// Add data to levelDB with value
function addDataToLevelDB(value) {
  let i = 0;
  return new Promise ((resolve, reject) => {
    db.createReadStream().on('data', (data) => {
          i++;
        }).on('error', (err) => {
           console.log('Unable to read data stream!', err);
           reject(err); 
        }).on('close', () => {
          console.log('Block #' + i);
          resolve(addLevelDBData(i, value));
        });
  });
}
module.exports.addDataToLevelDB = addDataToLevelDB;

//this method will return the number of blocks in the db
function getBlocksCount() {
  let blockCount = 0; 
  // Add your code here
  return new Promise(function(resolve, reject){
      db.createReadStream()
      .on('data', function (data) {
            // Count each object inserted
            blockCount++; 
       })
      .on('error', function (err) {
          // reject with error
          reject(err);
       })
       .on('close', function () {
          //resolve with the count value
          resolve(blockCount);
      });
  });
}
module.exports.getBlocksCount = getBlocksCount;



/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/
/*
(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data' + i).then((value) =>{
      //something to do with value i.e. result?
      console.log(value);
    });
    if (--i) theLoop(i);
  }, 100);
})(10);
*/
