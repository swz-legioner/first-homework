export class InvalidTokenKindError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'InvalidTokenKindError';
    }
}
