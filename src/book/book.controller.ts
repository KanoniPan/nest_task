import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { classToPlain } from 'class-transformer';

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @ApiQuery({
    name: 'authorId',
    required: false,
    type: String,
  })
  findAll(@Query('authorId') authorId?: string): Promise<Record<string, any>> {
    return this.bookService.findAll(authorId).then(it => classToPlain(it));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Record<string, any>> {
    return this.bookService.findOne(id).then(it => classToPlain(it));
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
  async update(
    @Param('id') id: string,
    @Body() bookData: UpdateBookDto,
  ): Promise<void> {
    return this.bookService.update(id, bookData);
  }
}
