export class PasswordInvalidError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'PasswordInvalidError';
    }
}
