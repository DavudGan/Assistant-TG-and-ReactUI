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
import { BUTTONS, renderTasks, renderTask } from './task-utils';

@Update()
@Injectable()
export class TasksController {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly tasksService: TasksService,
  ) {}
  @Start()
  async startCommand(ctx: Context) {
    const userName = ctx.from?.first_name || 'друг';
    await ctx.reply(
      `Привет, ${userName}! 😜\n\n Начнем день с кофе ☕️ и задачек? 🥸`,
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

    await ctx.reply('Задачи 📋:', renderTasks(todos, ctx.session.page));
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
    await ctx.editMessageText(
      'Вот твои задачи друг:',
      renderTasks(todos, page),
    );
  }

  @Action(/task_(\d+)/)
  async task(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    const userId = ctx.callbackQuery.from.id;
    const task = await this.tasksService.getById(taskId, userId);

    await renderTask(ctx, task.title, task.description, task.date, task.time);
  }

  @Action(/done_(\d+)/)
  async doneTask(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    const userId = ctx.callbackQuery.from.id;

    await this.tasksService.doneTask(taskId, userId);
    await ctx.editMessageText('Фух, долой задачи! ✅');
  }

  @Action(/edit_(\d+)/)
  async editTask(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    ctx.session = { type: 'edit', taskId: taskId };
    await ctx.reply('Введи новое название для задачи 🙈:');
    // await this.tasksService.editTaskTask(taskId, userId, newName);
  }

  @Action(/delete_(\d+)/)
  async removeTask(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
    const taskId = Number(ctx.match[1]);
    const userId = ctx.callbackQuery.from.id;

    await this.tasksService.deleteTask(taskId, userId);
    await ctx.editMessageText('Задача удалена! 🗑');
  }

  @Action('setDate')
  async setDate(@Ctx() ctx: Context) {
    await ctx.reply('Введи дату в формате: ДД.ММ.ГГГГ\n\nПример: 17.06.2000');
    ctx.session.type = 'add_date';
  }

  @Hears(BUTTONS.ADD_TASK)
  async addTask(ctx: Context) {
    ctx.session.type = 'add_title';
    await ctx.reply(`Как назовём задачку?`);
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
      return;
    }

    if (ctx.session.type === 'add_title') {
      ctx.session.taskTitle = message;
      ctx.session.type = 'add_description';
      await ctx.reply('Круто, давай добавим описание к задачке:');
      return;
    }

    if (ctx.session.type === 'add_description') {
      ctx.session.taskDescription = message;
      await ctx.reply(
        'Установим дату и время когда я напомню тебе о задаче 📅?',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Да', callback_data: 'setDate' }],
              [{ text: 'Нет', callback_data: 'setDate' }],
            ],
          },
        },
      );
      return;
    }

    if (ctx.session.type === 'add_date') {
      const date = message.trim();
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

      if (!dateRegex.test(date)) {
        await ctx.reply(
          '❌ Неверный формат даты 🙊! Введи дату в формате: ДД.ММ.ГГГГ\n\nПример: 17.06.2000',
        );
        return;
      }

      const [day, month, year] = date.split('.').map(Number);
      const validDate = new Date(year, month - 1, day);

      if (
        validDate.getFullYear() !== year ||
        validDate.getMonth() + 1 !== month ||
        validDate.getDate() !== day
      ) {
        await ctx.reply('❌ Такой даты не существует 🙈! Попробуй снова.');
        return;
      }

      ctx.session.taskDate = date;
      await ctx.reply(
        '✅ Дата успешно добавлена! Теперь введи время в формате: ЧЧ:ММ\n\nПример: 20:13',
      );
      ctx.session.type = 'add_time';
      return;
    }

    if (ctx.session.type === 'add_time') {
      const time = message.trim();
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

      if (!timeRegex.test(time)) {
        await ctx.reply(
          '❌ Неверный формат времени 🙈! Введи время в формате: ЧЧ:ММ\n\nПример: 20:13',
        );
        return;
      }

      ctx.session.taskTime = time;

      const title = ctx.session.taskTitle;
      const description = ctx.session.taskDescription;
      const date = ctx.session.taskDate;

      await this.tasksService.addTask(title, description, date, time, userId);

      await renderTask(ctx, title, description, date, time);

      ctx.session = null;
      return;
    }
  }
}
