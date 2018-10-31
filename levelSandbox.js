/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value){
  let self = this; 
  return new Promise((resolve, reject) => {
    self.db.put(key, value, (err) => {
      if (err) {
        console.log('Block ' + key + ' submission failed', err);
        reject(err);
      }
      resolve(value);
    });
  });
}

// Get data from levelDB with key
function getLevelDBData(key){
  let self = this;
  return Promise((resolve, reject) => {
    self.db.get(key, (err, value) => {
      if (err) {
        if(err.type == 'notFoundError') {
          resolve(undefined);
        } else {
          console.log('Not found!', err);
          reject(err);
        }
      } else {
          console.log('Value = ' + value);
          resolve(value);
      }
    });
  });
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
  let self = this; 
  let i = 0;
  return new Promise ((resolve, reject) => {
    self.db.createReadStream().on('data', (data) => {
          i++;
        }).on('error', (err) => {
           console.log('Unable to read data stream!', err);
           reject(err); 
        }).on('close', () => {
          console.log('Block #' + i);
          resolve(self.addLevelDBData(i, value));
        });
  });
}

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
const db = new LevelSandbox();
(function theLoop (i) {
  setTimeout(function () {
    db.addDataToLevelDB('Testing data').then((value) =>{
      //something to do with value i.e. result?
    });
    if (--i) theLoop(i);
  }, 100);
})(10);
*/
