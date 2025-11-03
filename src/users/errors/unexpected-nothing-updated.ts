export class UnexpectedNothingUpdatedError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'UnexpectedNothingUpdatedError';
    }
}
