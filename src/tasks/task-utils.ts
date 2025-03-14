import { Markup } from 'telegraf';

export const BUTTONS = {
  TASK_LIST: '📋 Список задач',
  EDIT_TASK: '✍🏼 Изменит задачу',
  DELETE_TASK: '🗑️ Удалит задачу',
  ADD_TASK: '📝 Добавить задачку',
  DOUN_TASK: '✅ Сделал задачку',
};

export const previewTask = (task) =>
  `Твой список задач 💁🏼: \n\n${task
    .map(
      (item) =>
        (item.isCompleted ? '✅ ' : '❌ ') + item.id + item.text + '\n\n',
    )
    .join('')}`;

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
        `${task.isCompleted ? '✅' : '❌'} ${task.text}`,
        `ignore`,
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
