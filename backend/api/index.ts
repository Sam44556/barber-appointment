import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import { IncomingMessage, ServerResponse } from 'http';

const expressServer = express();
let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return expressServer;

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressServer),
    { logger: ['error', 'warn'] },
  );

  // CORS — allow Vercel frontend domain
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || '*',
      /\.vercel\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix — all routes are under /api
  app.setGlobalPrefix('api');

  await app.init();
  isInitialized = true;
  return expressServer;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const server = await bootstrap();
  server(req, res);
}
