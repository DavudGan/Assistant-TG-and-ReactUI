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

  async addTask(
    title: string,
    description: string,
    date: string,
    time: string,
    userId: number,
  ) {
    const task = this.taskRepository.create({
      title,
      description,
      userId,
      date,
      time,
    });
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

  async getTasksToRemind(now: string) {
    const tasks = await this.taskRepository.find();
    return tasks.filter(
      (task) => task.date + ' ' + task.time === now && !task.reminded,
    );
  }

  async markTaskAsReminded(taskId: number) {
    const tasks = await this.taskRepository.find();
    const task = tasks.find((task) => task.id === taskId);
    if (task) task.reminded = true;
  }

  async editTask(
    id: number,
    userId: number,
    newName: string,
    // description: string,
  ) {
    const task = await this.getById(id, userId);
    if (!task) return null;
    console.log(task);
    task.title = newName;
    // task.description = description;
    await this.taskRepository.save(task);
    return task;
  }

  async deleteTask(id: number, userId: number) {
    const task = await this.getById(id, userId);
    if (!task) return null;

    return this.taskRepository.delete(task);
  }
}
