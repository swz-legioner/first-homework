import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1760296278140 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        length: '32',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                    },
                    {
                        name: 'age',
                        type: 'smallint',
                    },
                    {
                        name: 'description',
                        type: 'text',
                    },
                    {
                        name: 'deletedDate',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }
}
