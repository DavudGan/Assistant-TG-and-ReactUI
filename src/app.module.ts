import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './tasks/task.entity';
import * as LocalSession from 'telegraf-session-local';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
        middlewares: [sessions.middleware()],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT'), 10),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
    }),
    TypeOrmModule.forFeature([TaskEntity]),
    TasksModule,
  ],
  providers: [AppService, AppController],
  controllers: [],
})
export class AppModule {}
