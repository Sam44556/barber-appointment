import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Parse the connection string manually to avoid SASL issues with @ in password
    const pool = new Pool({
      host: 'aws-1-eu-west-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.icamcvsgltzuqsogowte',
      password: 'bestfor@barbe', // Direct password without encoding
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}