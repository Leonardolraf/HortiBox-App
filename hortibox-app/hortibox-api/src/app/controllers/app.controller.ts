import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from '../services/app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Retorna a mensagem padrão do serviço' })
  @ApiResponse({ status: 200, description: 'Mensagem retornada com sucesso' })
  getHello(): string {
    return this.appService.getHello();
  }
}
