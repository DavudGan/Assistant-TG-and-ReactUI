import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
  session: {
    type?:
      | 'done'
      | 'edit'
      | 'remove'
      | 'add_title'
      | 'add_description'
      | 'add_date'
      | 'add_time';
    page?: number;
    taskId?: number;
    taskTitle?: string;
    taskDescription?: string;
    taskDate?: string;
    taskTime?: string;
  };
}
