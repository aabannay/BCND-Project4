/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {
  constructor() {
    this.db = level(chainDB);
  }
  // Add data to levelDB with key/value pair
  addLevelDBData(key,value){
    this.db.put(key, value, function(err) {
      if (err) return console.log('Block ' + key + ' submission failed', err);
    })
  }

  // Get data from levelDB with key
  getLevelDBData(key){
    this.db.get(key, function(err, value) {
      if (err) return console.log('Not found!', err);
      console.log('Value = ' + value);
    })
  }

  // Add data to levelDB with value
  addDataToLevelDB(value) {
    const self = this; 
    let i = 0;
    this.db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          self.addLevelDBData(i, value);
        });
  }
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


//const LevelSandboxClass = require('LevelSandbox');
const db = new LevelSandbox();
(function theLoop (i) {

  setTimeout(function () {
    db.addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);
