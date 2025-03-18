import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Cron } from '@nestjs/schedule';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { Context } from '../context.interface';
import * as dayjs from 'dayjs';

@Injectable()
export class TaskReminderService implements OnModuleInit {
  private readonly logger = new Logger(TaskReminderService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly tasksService: TasksService,
  ) {}

  onModuleInit() {
    this.logger.log('TaskReminderService инициализирован.');
  }

  @Cron('*/1 * * * *') // Запускается каждую минуту
  async checkTasks() {
    const now = dayjs().format('DD.MM.YYYY HH:mm');
    const tasksToRemind = await this.tasksService.getTasksToRemind(now);

    for (const task of tasksToRemind) {
      await this.bot.telegram.sendMessage(
        task.userId,
        `🔔 Напоминание о задаче:\n\n📌 *${task.title}*\n 📝 *${task.description}*\n 📅 *${task.date}*\n ⏰ *${task.time}*`,
        { parse_mode: 'Markdown' },
      );

      // Отмечаем задачу чтобы не напоминать снова
      await this.tasksService.markTaskAsReminded(task.id);
    }
  }
}
