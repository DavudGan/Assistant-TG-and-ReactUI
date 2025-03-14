import { Markup } from 'telegraf';
import { BUTTONS } from './tasks/task-utils';

export function actionButton() {
  return Markup.keyboard(
    [
      Markup.button.callback(BUTTONS.TASK_LIST, 'list'),
    //   Markup.button.callback(BUTTONS.EDIT_TASK, 'edit'),
    //   Markup.button.callback(BUTTONS.DOUN_TASK, 'doun'),
    //   Markup.button.callback(BUTTONS.DELETE_TASK, 'delete'),
      Markup.button.callback(BUTTONS.ADD_TASK, 'add'),
    ],
    {
      columns: 3,
    },
  ).resize();
}
