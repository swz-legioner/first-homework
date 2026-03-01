export class MoneySentEvent {
    constructor(
        public from: string,
        public to: string,
        public amount: number,
        public timestamp: number,
    ) {}

    toString() {
        return JSON.stringify({
            from: this.from,
            to: this.to,
            amount: this.amount,
            timestamp: this.timestamp,
        });
    }
}

export const MoneySentEventName = 'money_sent';
