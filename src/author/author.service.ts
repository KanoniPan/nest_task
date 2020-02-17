import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ObjectID } from 'mongodb';
import { Book } from '../book/book.entity';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find();
  }

  create(createAuthorDto: CreateAuthorDto) {
    const author = new Author();

    author.birthday = createAuthorDto.birthday;
    author.firstName = createAuthorDto.firstName;
    author.lastName = createAuthorDto.lastName;
    author.books = [];
    return this.authorRepository.save(author);
  }

  findOne(id: string): Promise<Author> {
    return this.authorRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(
        `Author with ${id} was not found`,
        HttpStatus.NOT_FOUND,
      );
    });
  }

  async remove(id: string): Promise<void> {
    await this.authorRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(
        `Author with ${id} was not found`,
        HttpStatus.NOT_FOUND,
      );
    });
    await this.authorRepository.delete(id);
  }

  async update(id: string, author: UpdateAuthorDto): Promise<void> {
    const toUpdate = await this.authorRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(
        `Author with ${id} was not found`,
        HttpStatus.NOT_FOUND,
      );
    });

    const ids = author.books.map(it => new ObjectID(it));
    const booksExists = await this.bookRepository.findByIds(ids, {});

    if (ids.length !== booksExists.length) {
      throw new HttpException(
        `Check if Book id is correct or it is not a duplicate`,
        HttpStatus.NOT_FOUND,
      );
    }

    const update = { ...toUpdate, ...author };

    await this.authorRepository.update(id, update);
  }
}
