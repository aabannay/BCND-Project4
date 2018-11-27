class ValidationRequest{
	constructor(address){
		this.walletAddress = address; 
		this.requestTimeStamp = new Date().getTime().toString().slice(0,-3);
		this.message = `${address}:${this.requestTimeStamp}:starRegistry`;
		this.validationWindow = 300; //5 minutes i.e. 300 seconds
	}
}
module.exports.ValidationRequest = ValidationRequest;