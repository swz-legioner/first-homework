export class UserNotFoundError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'UserNotFoundError';
    }
}
