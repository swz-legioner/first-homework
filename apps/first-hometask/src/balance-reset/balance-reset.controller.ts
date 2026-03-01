import { Controller, Post, UnauthorizedException } from '@nestjs/common';

import { User } from '../users/user.decorator';
import { type UserPayload } from '../utils/extractUserPayload';

import { BalanceResetService } from './balance-reset.service';
import { BalanceResetDto } from './dto/balance-reset.dto';
import { StartResetJobDocs } from './docs/balance-reset.docs';

@Controller('balance-reset')
export class BalanceResetController {
    constructor(private service: BalanceResetService) {}

    @Post()
    @StartResetJobDocs()
    async startResetJob(@User() user: UserPayload): Promise<BalanceResetDto> {
        if (user.name !== 'admin') {
            throw new UnauthorizedException();
        }
        return this.service.startResetJob();
    }
}
