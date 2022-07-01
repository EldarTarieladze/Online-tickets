import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() { }
  async healthCheck() {
    return 'Healthcheck Complete'
  }
}
