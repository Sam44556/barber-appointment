import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';

const expressServer = express();
let app: any = null;

async function bootstrap() {
  if (app) return expressServer;

  app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressServer),
    { logger: ['error', 'warn'] },
  );

  app.enableCors({
    origin: '*',
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

  app.setGlobalPrefix('api');
  await app.init();
  return expressServer;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const server = await bootstrap();
    server(req, res);
  } catch (error: any) {
    console.error('Bootstrap error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bootstrap failed',
      message: error?.message || 'Unknown error',
      stack: error?.stack?.split('\n').slice(0, 8),
    }));
  }
}
