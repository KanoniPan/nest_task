import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Column, Repository} from 'typeorm';
import { Author } from "./crud.entity";
import {CreateAuthorDto} from "./dto/create-author.dto";

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find();
  }

  create(createAuthorDto: CreateAuthorDto) {
    const author = new Author();

    author.birthday = createAuthorDto.birthday;
    author.firstName = createAuthorDto.firstName;
    author.lastName = createAuthorDto.lastName;

    return this.authorRepository.save(author);
  }


  findOne(id: string): Promise<Author> {
    return this.authorRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
      await this.authorRepository.delete(id);
  }
}
