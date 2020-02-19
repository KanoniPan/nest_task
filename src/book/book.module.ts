import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Author } from '../author/author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author])],
  providers: [BookService],
  controllers: [BookController],
})
export class BookModule {}
