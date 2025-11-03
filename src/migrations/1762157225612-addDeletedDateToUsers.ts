import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedDateToUsers1762157225612 implements MigrationInterface {
    public async up(q: QueryRunner): Promise<void> {
        await q.addColumn(
            'users',
            new TableColumn({
                name: 'deletedDate',
                type: 'timestamptz',
                isNullable: true,
            }),
        );
    }

    public async down(q: QueryRunner): Promise<void> {
        await q.dropColumn('users', 'deletedDate');
    }
}
