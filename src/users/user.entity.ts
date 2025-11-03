import {
    Column,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 32 })
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column('smallint')
    age: number;

    @Column('text')
    description: string;

    @DeleteDateColumn()
    deletedDate: Date;
}
