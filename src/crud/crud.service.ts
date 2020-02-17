import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from "./crud.entity";
import { CreateAuthorDto } from "./dto/create-author.dto";

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {
  }

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
      throw new HttpException(`Author with ${id} was not found`, HttpStatus.NOT_FOUND);
    });
  }

  async remove(id: string): Promise<void> {
    await this.authorRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(`Author with ${id} was not found`, HttpStatus.NOT_FOUND);
    });
    await this.authorRepository.delete(id);
  }

  async update(id: string, author: CreateAuthorDto): Promise<void> {
    let toUpdate = await this.authorRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(`Author with ${id} was not found`, HttpStatus.NOT_FOUND);
    });
    let update = {...toUpdate, ...author};

    await this.authorRepository.update(id, update);
  }
}
