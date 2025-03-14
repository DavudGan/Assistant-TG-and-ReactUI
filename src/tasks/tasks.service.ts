import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async getAll(userId: number) {
    return this.taskRepository.find({ where: { userId } });
  }

  async getById(id: number, userId: number) {
    return this.taskRepository.findOneBy({ id, userId });
  }

  async addTask(text: string, userId: number) {
    const task = this.taskRepository.create({ text, userId });
    await this.taskRepository.save(task);
    return this.getAll(userId);
  }

  async doneTask(id: number, userId: number) {
    const task = await this.getById(id, userId);
    if (!task) return null;
    console.log(task);
    task.isCompleted = !task.isCompleted;
    await this.taskRepository.save(task);
    return task;
  }

  async editTask(id: number, userId: number, newName: string) {
    const task = await this.getById(id, userId);
    if (!task) return null;
    console.log(task);
    task.text = newName;
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTask(id: number, userId: number) {
    const task = await this.getById(id, userId);
    if (!task) return null;

    return this.taskRepository.delete(task);
  }
}
