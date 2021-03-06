const bitcoinMessage = require('bitcoinjs-message'); 
const ValidationRequestClass = require('./ValidationRequest');
const ValidRequestClass = require('./ValidRequest');

//minutes by seconds by milliseconds (5 minutes)
const TimeoutRequestsWindowTime = 5*60*1000; 

class Mempool{
  constructor(){
    this.mempool = [];
    this.timeoutRequests = [];
    this.mempoolValid = [];
    
  }

  addRequestValidation(request){
    //check if request already added to mempool
    if (this.mempool[request.walletAddress]) {
      //the request is already in mempool so return the request object
      console.log('existing request');
      //return the existing request in the database NOT the new request with the same address!
      //update the time first then return 
      this.updateValidationWindow(this.mempool[request.walletAddress]);
      return this.requestObject(this.mempool[request.walletAddress]);
    } else {
      this.mempool[request.walletAddress] = request;
      this.setTimeOut(request);
      return this.requestObject(request);
    }
    
  }

  setTimeOut(request){
    let self = this;
    this.timeoutRequests[request.walletAddress]=
      setTimeout(function(){ 
        self.removeValidationRequest(request.walletAddress) 
      }, TimeoutRequestsWindowTime );
  }

  removeValidationRequest(address){
    //use the delete keyword to remove teh object by address
    delete this.mempool[address];
    //also it should be removed from. the validation pool. it should stay here for 5 minutes, too. 
    delete this.mempoolValid[address];
  }

  //this method is used to clean the timeout requests array upon returning the validation object. 
  removeTimeoutRequest(address) {
    //use the delete keyword to remove the object by address
    delete this.timeoutRequests[address];

  }

  //this method will return the request object after it has been
  //created and therefore, no need to update the validation window.
  requestObject(request) {
    return request;   
  }

  updateValidationWindow(request) {
    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - request.requestTimeStamp;
    let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
    request.validationWindow = timeLeft;
  }

  validateRequestByWallet(address, signature) {
    // get the request from mempool 
    let request = this.mempool[address];
    //response object to be returned by this function 
    //it contain the validation boolean value in addition to a reason IF validation fails.   
    let response = {
      isValid: false, 
      reason: ''
    }; 
    if (request) {
      //verify the windowTime
      let isValidWindowTime = false; 
      this.updateValidationWindow(request);
      if (request.validationWindow > 0) {
        //continue since the request still valid
        isValidWindowTime = true; 
        //create the validation object to be stored in the mempool valid
        let validRequestObject = new ValidRequestClass.ValidRequest(request);
        let isValidMessageSignature = bitcoinMessage.verify(request.message, address, signature);
        if (isValidMessageSignature) {
          //set the truth values within the valid request object. 
          validRequestObject.registerStar = true; 
          validRequestObject.status.messageSignature = true;
          //add the valid Request Object to mempool valid now. 
          this.mempoolValid[address] = validRequestObject;
          response.isValid = true; 
          return response;  
        } else {
          //failed because message signature is not valid.
          response.reason = 'message signature is not valid';
          return response; 
        }
      } else {
        //failed because out of validation window.
        response.reason = 'request validation timout';
        return response; 
      }
    } else {
      //the validation request is not in mempool (maybe never existed or removed due timeout)
      response.reason = 'request is not in mempool'
      return response; 
    }
  }

  verifyAddressRequest(address) {
    let request = this.mempoolValid[address];
    //if request is still in mempool valid then it is valid and within timewindow i.e. it was not removed due to timeout. 
    if (request) {
      return true; 
    } else {
      //there is no validation request in the valid pool with this address or it was removed from there due to timeout
      return false; 
    }
  }

  removeValidationRequest(address) {
    delete this.mempoolValid[address];
    if (!this.mempoolValid[address]) {
      return true;
    } else {
      return false; 
    }
  } 
}

module.exports.Mempool = Mempool; 