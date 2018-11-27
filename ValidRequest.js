class ValidRequest{
	constructor(request){
		this.registerStar = false; 
		this.status = {
			address: request.walletAddress, 
			requestTimeStamp: request.requestTimeStamp,
   			message: request.message,
   			validationWindow: request.validationWindow,
   			messageSignature: false
		};
	}
}
module.exports.ValidRequest = ValidRequest;