export class UserAlreadyExistsError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'UserAlreadyExistsError';
    }
}
