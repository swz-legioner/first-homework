import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BalanceResetService {
    private readonly logger = new Logger(BalanceResetService.name);

    constructor(@InjectQueue('balance') private queue: Queue) {}

    async startResetJob() {
        const { waiting, active } = await this.queue.getJobCounts();
        if (waiting !== 0 || active !== 0) {
            this.logger.log(
                'Job to reset all users balances already scheduled',
            );
            return {
                created: false,
            };
        }

        this.logger.log('Job to reset all users balances requested');
        await this.queue.add('reset', {});

        return {
            created: true,
        };
    }
}
