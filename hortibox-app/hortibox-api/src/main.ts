import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HABILITA CORS para aceitar chamadas do frontend
  app.enableCors({
    origin: 'http://localhost:3001', // ou use '*' durante o desenvolvimento
  });

  const config = new DocumentBuilder()
    .setTitle('Documentação da API')
    .setDescription('Endpoints disponíveis no sistema')
    .setVersion('1.0')
    .addTag('Products')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
