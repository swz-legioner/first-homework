import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBalanceToUsers1767535467162 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'balance',
                type: 'numeric',
                precision: 10,
                scale: 2,
                default: '0',
                isNullable: false,
            }),
        );

        await queryRunner.query(`
            ALTER TABLE users
            ADD CONSTRAINT balance_non_negative
            CHECK (balance >= 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            DROP CONSTRAINT balance_non_negative
        `);

        await queryRunner.dropColumn('users', 'balance');
    }
}
