import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Task' })
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column()
  userId: number;

  @Column({ default: '00:00:0000' })
  date: string;

  @Column({ default: '00:00' })
  time: string;

  @Column({ default: false })
  reminded: boolean;
}
