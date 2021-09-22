import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { User } from '../../users/entities/User';


@Entity('transfers')
export class Transfer {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column()
    sender_id: string;

    @Column()
    receiver_id: string;

    @Column('decimal', { precision: 9, scale: 2 })
    amount: number;

    @Column()
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @CreateDateColumn()
    updated_at: Date;

    constructor() {
        if (!this.id) {
            this.id = uuid();
        }
    }
}
