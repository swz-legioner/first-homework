import {
    Column,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Avatar } from './avatars.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    @OneToMany(() => Avatar, (avatar) => avatar.user)
    avatars: Avatar[];

    @DeleteDateColumn()
    deletedDate?: Date;
}
