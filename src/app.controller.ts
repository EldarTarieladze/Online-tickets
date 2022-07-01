import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('HealthCeck')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('healthcheck')
  async getHello() {
    return await this.appService.healthCheck();
  }

}
