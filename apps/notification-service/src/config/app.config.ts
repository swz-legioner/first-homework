import { getConfig, getEnv } from '@app/common';
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
    const env = getEnv();

    return getConfig(env);
});
