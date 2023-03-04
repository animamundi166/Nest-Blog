import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TagModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
