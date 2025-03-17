import { Injectable } from '@nestjs/common';
import { Action, Ctx, InjectBot, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from '../context.interface';

@Injectable()
@Update()
export class DateTimePickerService {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  // async showYearSelection(ctx: Context) {
  //   const currentYear = new Date().getFullYear();
  //   const years = [currentYear, currentYear + 1];
  //   await ctx.reply('Выбери год 📅:', {
  //     reply_markup: {
  //       inline_keyboard: years.map((year) => [
  //         { text: `${year}`, callback_data: `year_${year}` },
  //       ]),
  //     },
  //   });
  // }

  // @Action('start_year_selection')
  // async startYearSelection(@Ctx() ctx: Context) {
  //   await this.showYearSelection(ctx);
  // }

  // @Action(/year_(\d+)/)
  // async selectYear(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
  //   const year = Number(ctx.match[1]);
  //   ctx.session.taskYear = year;

  //   const months = [
  //     'Январь',
  //     'Февраль',
  //     'Март',
  //     'Апрель',
  //     'Май',
  //     'Июнь',
  //     'Июль',
  //     'Август',
  //     'Сентябрь',
  //     'Октябрь',
  //     'Ноябрь',
  //     'Декабрь',
  //   ];

  //   await ctx.reply('Выбери месяц 📅:', {
  //     reply_markup: {
  //       inline_keyboard: months.map((month, index) => [
  //         { text: month, callback_data: `month_${index + 1}` },
  //       ]),
  //     },
  //   });
  // }

  // @Action(/month_(\d+)/)
  // async selectMonth(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
  //   const month = Number(ctx.match[1]);
  //   ctx.session.taskMonth = month;
  //   const daysInMonth = new Date(ctx.session.taskYear, month, 0).getDate();

  //   const buttons = [];
  //   for (let day = 1; day <= daysInMonth; day++) {
  //     buttons.push({ text: `${day}`, callback_data: `day_${day}` });
  //   }

  //   const rows = [];
  //   while (buttons.length) rows.push(buttons.splice(0, 7));

  //   await ctx.reply('Выбери день 📅:', {
  //     reply_markup: { inline_keyboard: rows },
  //   });
  // }

  // @Action(/day_(\d+)/)
  // async selectDay(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
  //   const day = Number(ctx.match[1]);
  //   ctx.session.taskDay = day;

  //   const timeButtons = [];
  //   for (let hour = 0; hour < 24; hour++) {
  //     for (let minute = 0; minute < 60; minute += 15) {
  //       const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  //       timeButtons.push({
  //         text: timeString,
  //         callback_data: `time_${timeString}`,
  //       });
  //     }
  //   }

  //   const rows = [];
  //   while (timeButtons.length) rows.push(timeButtons.splice(0, 4));

  //   await ctx.reply('Выбери время ⏰:', {
  //     reply_markup: { inline_keyboard: rows },
  //   });
  // }

  // @Action(/time_(\d{2}:\d{2})/)
  // async selectTime(@Ctx() ctx: Context & { match: RegExpMatchArray }) {
  //   const time = ctx.match[1];
  //   ctx.session.taskTime = time;

  //   await ctx.reply(
  //     `✅ Ты выбрал дату и время: ${ctx.session.taskYear}-${ctx.session.taskMonth}-${ctx.session.taskDay} ${time}`,
  //   );
  // }
}
