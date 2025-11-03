export class UserNotCreatedError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'UserNotCreatedError';
    }
}
