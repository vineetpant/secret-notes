import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SecretNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  note: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
