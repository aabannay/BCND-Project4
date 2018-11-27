const ValidationRequestClass = require('./ValidationRequest');

//minutes by seconds by milliseconds (5 minutes)
const TimeoutRequestsWindowTime = 5*60*1000; 

class Mempool{
  constructor(){
    this.mempool = [];
    this.timeoutRequests = [];
    
  }

  addRequestValidation(request){
    //check if request already added to mempool
    if (this.mempool[request.walletAddress]) {
      //the request is already in mempool so return the request object
      console.log('existing request');
      //return the existing request in the database NOT the new request with the same address!
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

  }

  //this method will return the request object after it has been
  //created and therefore, no need to update the validation window.
  requestObject(request) {
    console.log('request object called for request: ' + request);
    return request;   
  }

  updateValidationWindow(request) {
    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
    let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
    request.validationWindow = timeLeft;
  }
}

module.exports.Mempool = Mempool; 