export class ExpectedNothingUpdatedError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'ExpectedNothingUpdatedError';
    }
}
