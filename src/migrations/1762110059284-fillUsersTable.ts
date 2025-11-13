import { User } from '../users/user.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { InsertResult } from 'typeorm/browser';

import bcrypt from 'bcrypt';
import { appendFile, writeFile } from 'fs/promises';
import path from 'path';

const TEST_USERS_COUNT = 130;

function randomString(length: number = 16) {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength),
        );
    }
    return result;
}

function randomInt(min: number = 18, max: number = 99) {
    return Math.round(Math.random() * (max - min)) + min;
}

function randomEmail() {
    return `${randomString(10)}.${randomString(4)}@gmail.com`;
}

export class FillUsersTable1762110059284 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const processing: Promise<InsertResult>[] = [];
        const userRepository = queryRunner.manager.getRepository(User);

        const salt = await bcrypt.genSalt();

        const credentialsFile = path.join(
            __dirname,
            '../../../',
            'credentials.csv',
        );

        await writeFile(credentialsFile, 'user, password');

        for (let i = 0; i < TEST_USERS_COUNT; i++) {
            const username = randomString(randomInt(4, 32));
            const password = randomString(randomInt(8, 32));

            await appendFile(credentialsFile, `\n${username}, ${password}`);

            const user = {
                username,
                password: await bcrypt.hash(password, salt),
                email: randomEmail(),
                age: randomInt(),
                description: '',
            };

            user.description = `I'm a ${user.username}.
            My email - ${user.email}.
            I am ${user.age} years old.
            I can tell you about myself that i'm ${randomString(50)}.`;

            processing.push(userRepository.insert(user));
        }

        await Promise.all(processing);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userRepository = queryRunner.connection.getRepository(User);
        await userRepository.deleteAll();
    }
}
