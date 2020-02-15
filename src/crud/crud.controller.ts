import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {AuthorService} from "./crud.service";
import {Author} from "./crud.entity";
import {CreateAuthorDto} from "./dto/create-author.dto";
// TODO: - rename crud into author
@Controller('author')
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
}
