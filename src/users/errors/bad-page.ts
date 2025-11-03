export class BadPageError extends Error {
    constructor(message?: Error['message']) {
        super(message);
        this.name = 'BadPageError';
    }
}
