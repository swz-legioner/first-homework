import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('avatars')
export class Avatar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.avatars)
    user: User;

    @Column()
    filename: string;

    @CreateDateColumn()
    createdDate: Date;

    @DeleteDateColumn()
    deletedDate?: Date;
}
