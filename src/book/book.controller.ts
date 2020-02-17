import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import { BookService } from "./book.service";
import { Book } from "./book.entity";
import { CreateBookDto } from "./dto/create-book.dto";
import { UpdateBookDto } from "./dto/update-book.dto";

// TODO: - rename crud into author
@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {
  }

  @Get()
  findAll(): Promise<Book[]> {
    return this.bookService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.bookService.remove(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() bookData: UpdateBookDto) {
    return this.bookService.update(id, bookData);
  }
}
