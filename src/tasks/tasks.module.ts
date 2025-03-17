import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { TaskReminderService } from './task-reminder.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  controllers: [],
  providers: [TasksService, TasksController, TaskReminderService],
  exports: [TasksService],
})
export class TasksModule {}
