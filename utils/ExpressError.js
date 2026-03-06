class ExpressError extends Error{
    constructor(statusCode, message){
        super(message)
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.message = message; 
    }
}

module.exports =  ExpressError;