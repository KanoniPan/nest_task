import { Module } from '@nestjs/common';
import { Author } from './author/author.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorModule } from './author/author.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { Book } from './book/book.entity';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      database: 'my_crud',
      entities: [Author, Book],
      synchronize: false,
    }),
    AuthorModule,
    BookModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
