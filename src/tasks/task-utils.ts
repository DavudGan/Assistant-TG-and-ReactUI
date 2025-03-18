import { Context, Markup } from 'telegraf';

export const BUTTONS = {
  TASK_LIST: '📋 Список задач',
  EDIT_TASK: '✍🏼 Изменит задачу',
  DELETE_TASK: '🗑️ Удалит задачу',
  ADD_TASK: '📝 Добавить задачку',
  DOUN_TASK: '✅ Сделал задачку',
};

// Функция для отображения задач с пагинацией
export function renderTasks(tasks, page = 1, pageSize = 5) {
  const totalPages = Math.ceil(tasks.length / pageSize);
  const currentTasks = tasks.slice((page - 1) * pageSize, page * pageSize);

  const taskButtons = currentTasks.flatMap((task) => [
    // [
    //   // Разделитель между задачами
    //   Markup.button.callback(`⬇️Задача⬇️`, 'ignore'),
    // ],
    [
      // Первая строка - задача
      Markup.button.callback(
        `${task.isCompleted ? '✅' : '❌'} ${task.title}`,
        `task_${task.id}`,
      ),
    ],
    [
      // Вторая строка - кнопки управления
      Markup.button.callback('🥂 Завершить', `done_${task.id}`),
      Markup.button.callback('✍🏼 Изменит', `edit_${task.id}`),
      Markup.button.callback('🗑 Удалить', `delete_${task.id}`),
    ],
  ]);

  const paginationButtons = [];
  if (page > 1) {
    paginationButtons.push(
      Markup.button.callback('⬅️ Предыдущая', `page_${page - 1}`),
    );
  }
  if (page < totalPages) {
    paginationButtons.push(
      Markup.button.callback('➡️ Следующая', `page_${page + 1}`),
    );
  }

  return Markup.inlineKeyboard([...taskButtons, paginationButtons], {
    columns: 1,
  });
}

// Функция для отображения одной задач
export function renderTask(ctx: Context, title, description, date, time) {
  return ctx.reply(
    `Круто, ты добавил новую задачу:\n\nНазвание📌: *${title}*\nОписание📝: *${description}*\nДата 📅: *${date}*\nВремя ⏰: *${time}*`,
    { parse_mode: 'Markdown' },
  );
}
