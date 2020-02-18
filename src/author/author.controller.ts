import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { classToPlain } from 'class-transformer';

@ApiTags('authors')
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  findAll(): Promise<Object | Author[]> {
    return this.authorService.findAll().then(it => classToPlain(it));
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Object | Author> {
    return this.authorService.findOne(id).then(it => classToPlain(it));
  }

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService
      .create(createAuthorDto)
      .then(it => classToPlain(it));
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.authorService.remove(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() authorData: UpdateAuthorDto,
  ): Promise<void> {
    return this.authorService.update(id, authorData);
  }
}
