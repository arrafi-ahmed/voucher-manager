class CustomError extends Error {
    constructor({message = null, statusCode = null, payload = null}) {
        super(message);
        this.statusCode = statusCode || 500;
        this.payload = payload;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = CustomError;
