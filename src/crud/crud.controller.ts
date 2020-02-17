import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {AuthorService} from "./crud.service";
import {Author} from "./crud.entity";
import {CreateAuthorDto} from "./dto/create-author.dto";
import {ApiTags} from '@nestjs/swagger';

// TODO: - rename crud into author
@ApiTags('authors')
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {
  }

  @Get()
  findAll(): Promise<Author[]> {
    return this.authorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Author> {
    return this.authorService.findOne(id);
  }

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.authorService.remove(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() authorData: CreateAuthorDto) {
    return this.authorService.update(id, authorData);
  }
}
