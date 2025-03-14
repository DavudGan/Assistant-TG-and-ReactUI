import { TasksService } from './tasks.service';

import { Injectable } from '@nestjs/common';
import {
  Action,
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButton } from '../app.buttons';
import { Context } from '../context.interface';
import { BUTTONS, renderTasks } from './task-utils';

@Update()
@Injectable()
export class TasksController {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly tasksService: TasksService,
  ) {}
  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(
      'Привет! 😜\n\n Начнем день с кофе ☕️ и задачек ? 🥸',
      actionButton(),
    );
  }

  @Hears(BUTTONS.TASK_LIST)
  async getAll(ctx: Context) {
    const userId = ctx.message.from.id;
    const todos = await this.tasksService.getAll(userId);

    if (todos.length === 0) {
      return ctx.reply('У тебя пока нет задачек! 😕');
    }

    if (ctx.message) {
      await ctx.deleteMessage(); // Удаляет текущее сообщение
    }

    // Устанавливаем текущую страницу в session
    if (!ctx.session.page) {
      ctx.session.page = 1; // Если это первый запрос, начинаем с первой страницы
    }

    await ctx.reply('Вот твои задачи:', renderTasks(todos, ctx.session.page));
  }

  @Action(/page_(\d+)/)
  async changePage(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const userId = ctx.callbackQuery.from.id;
    const page = Number(ctx.match[1]);

    // Получаем все задачи пользователя
    const todos = await this.tasksService.getAll(userId);

    // Обновляем страницу в session
    ctx.session.page = page;

    // Отправляем задачи с новой страницы
    await ctx.editMessageText('Вот твои задачи:', renderTasks(todos, page));
  }

  @Action(/done_(\d+)/)
  async doneTask(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    const userId = ctx.callbackQuery.from.id;

    await this.tasksService.doneTask(taskId, userId);
    await ctx.editMessageText('Задача отмечена как завершённая! ✅');
  }

  @Action(/edit_(\d+)/)
  async editTask(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    ctx.session = { type: 'edit', taskId: taskId };
    await ctx.reply('Введите новое название для задачи:');
    // await this.tasksService.editTaskTask(taskId, userId, newName);
  }

  @Action(/delete_(\d+)/)
  async removeTask(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    const userId = ctx.callbackQuery.from.id;

    await this.tasksService.deleteTask(taskId, userId);
    await ctx.editMessageText('Задача удалена! 🗑');
  }

  @Hears(BUTTONS.ADD_TASK)
  async addTask(ctx: Context) {
    ctx.session.type = 'add';
    await ctx.reply(`🐒 Что добавим в журнал маймунки ?`);
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    const userId = ctx.message.from.id;
    if (!ctx.session.type) return;

    // Проверяем, находится ли пользователь в режиме редактирования
    if (ctx.session?.type === 'edit' && ctx.session?.taskId) {
      const taskId = ctx.session.taskId;
      const newName = message;

      // Сброс состояния редактирования
      ctx.session = null;

      // Сохранение нового имени задачи
      const updatedTask = await this.tasksService.editTask(
        taskId,
        userId,
        newName,
      );

      if (updatedTask) {
        await ctx.reply(`✅ Задача успешно изменена на: "${newName}"`);
      } else {
        await ctx.reply(
          '❌ Ошибка при изменении задачи. Возможно, она не существует.',
        );
      }
    }

    if (ctx.session.type === 'add') {
      await this.tasksService.addTask(message, userId);
      await ctx.reply('Круто, у тебя новая задачка! 📌');
      // ctx.session.type = undefined;
    }
  }
}
