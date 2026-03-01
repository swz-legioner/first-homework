export class MoneySentEvent {
    constructor(
        public from: string,
        public to: string,
        public amount: number,
    ) {}

    toString() {
        return JSON.stringify({
            from: this.from,
            to: this.to,
            amount: this.amount,
        });
    }
}

export const MoneySentEventName = 'money_sent';
