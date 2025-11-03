export class UnexpectedNothingDeletedError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'UnexpectedNothingDeletedError';
    }
}
