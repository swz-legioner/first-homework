import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from 'typeorm';

export class CreateAvatarsTable1765644940576 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'avatars',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'filename',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'createdDate',
                        type: 'timestamptz',
                        isNullable: false,
                        default: 'now()',
                    },
                    {
                        name: 'deletedDate',
                        type: 'timestamptz',
                        isNullable: true,
                    },
                ],
            }),
        );

        await queryRunner.createIndex(
            'avatars',
            new TableIndex({
                name: 'IDX_AVATARS_USERID',
                columnNames: ['userId'],
            }),
        );

        await queryRunner.createForeignKey(
            'avatars',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('avatars');
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('userId') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('avatars', foreignKey);
        }
        await queryRunner.dropIndex('avatars', 'IDX_AVATARS_USERID');
        await queryRunner.dropTable('avatars');
    }
}
