import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { BalanceConsumer } from './balance-reset.consumer';
import { BalanceResetController } from './balance-reset.controller';
import { BalanceResetService } from './balance-reset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'balance',
        }),
        TypeOrmModule.forFeature([User]),
    ],
    providers: [BalanceResetService, BalanceConsumer],
    controllers: [BalanceResetController],
})
export class BalanceResetModule {}
