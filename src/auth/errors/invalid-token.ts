export class InvalidTokenError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'InvalidTokenError';
    }
}
