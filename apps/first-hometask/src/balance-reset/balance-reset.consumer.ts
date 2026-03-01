import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { User } from '../users/user.entity';

@Processor('balance')
export class BalanceConsumer extends WorkerHost {
    private readonly logger = new Logger(BalanceConsumer.name);

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
    ) {
        super();
    }

    async process(): Promise<any> {
        this.logger.log('Job to reset all users balances started');
        // Для проверки конкурентности
        await sleep();
        await this.usersRepository.update(
            { balance: Not('0') },
            { balance: '0' },
        );
        this.logger.log('Job to reset all users balances completed');
    }
}

function sleep() {
    return new Promise<void>((res) => {
        setTimeout(
            () => {
                res();
            },
            10 * 60 * 1000,
        );
    });
}
