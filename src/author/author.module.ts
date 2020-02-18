import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Author } from './author.entity';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { Book } from '../book/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book])],
  providers: [AuthorService],
  controllers: [AuthorController],
})
export class AuthorModule {}
