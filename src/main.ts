import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { dataSource } from "../config/dataSource";
import { AppModule } from "./app.module";
import { DatabaseExceptionFilter } from './exceptions/database-exception.filter';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';

async function bootstrap() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
  });

  const config = new DocumentBuilder()
    .setTitle('Greenly Test')
    .setDescription('Greenly API - Kévin')
    .setVersion('1.0')
    .build();
  
  patchNestjsSwagger();

  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalFilters(new DatabaseExceptionFilter())

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);
  await app.listen(3000);
}
Logger.log(`Server running on http://localhost:3000`, "Bootstrap");
bootstrap();
