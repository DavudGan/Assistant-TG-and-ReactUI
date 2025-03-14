// import { Controller, Get } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AppService } from './app.service';

@Injectable()
export class AppController {
  constructor(private readonly appService: AppService) {}
}
