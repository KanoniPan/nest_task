import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from "./book.entity";
import { CreateBookDto } from "./dto/create-book.dto";
import { Author } from "../crud/crud.entity";
import { ObjectID } from "mongodb";
import { UpdateBookDto } from "./dto/update-book.dto";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>
  ) {
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find();
  }

  async create(createBookDto: CreateBookDto) {
    const ids = createBookDto.authors.map(it => new ObjectID(it));
    const authorsExists = await this.authorRepository.findByIds(ids, {});

    if(ids.length !== authorsExists.length) {
      throw new HttpException(`Check if Author id is correct`, HttpStatus.NOT_FOUND);
    }

    const book = new Book();
 
    book.title = createBookDto.title;
    book.iban = createBookDto.iban;
    book.publishedAt = createBookDto.publishedAt;
    book.authors = authorsExists.map(it => it.id);

    const bookToReturn = await this.bookRepository.save(book);

    for (const author of authorsExists) {
      const authorToUpdate = new Author();
      authorToUpdate.books = author.books ? [bookToReturn.id, ...author.books] : [bookToReturn.id];
      let update = {...author, ...authorToUpdate};
      console.log('update', update);
      await this.authorRepository.save(update);
    }

    return bookToReturn;
  }


  findOne(id: string): Promise<Book> {
    return this.bookRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(`Book with ${id} was not found`, HttpStatus.NOT_FOUND);
    });
  }

  async remove(id: string): Promise<void> {
    const bookToRemove = await this.bookRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(`Book with ${id} was not found`, HttpStatus.NOT_FOUND);
    });


    const ids = bookToRemove.authors.map(it => new ObjectID(it));
    const authorsExists = await this.authorRepository.findByIds(ids, {});

    if(ids.length !== authorsExists.length) {
      throw new HttpException(`One of the authors doesn't exist`, HttpStatus.NOT_FOUND);
    }

    for (const author of authorsExists) {
      const authorToUpdate = new Author();
      authorToUpdate.books = author.books.filter(book => !book.equals(bookToRemove.id));
      let update = {...authorToUpdate, ...author};
      await this.authorRepository.save(update);
    }

    await this.bookRepository.delete(id);
  }

  async update(id: string, book: UpdateBookDto): Promise<void> {
    const ids = book.authors.map(it => new ObjectID(it));
    const authorsExists = await this.authorRepository.findByIds(ids, {});

    if(ids.length !== authorsExists.length) {
      throw new HttpException(`Check if Author id is correct or it is not a duplicate`, HttpStatus.NOT_FOUND);
    }

    let toUpdate = await this.bookRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(`Book with ${id} was not found`, HttpStatus.NOT_FOUND);
    });
    // book.authors = this.findDuplicates(book.authors);
    let update = {...toUpdate, ...book};

    await this.bookRepository.save(update);
  }

   findDuplicates = (arr) => {
    let sorted_arr = arr.slice().sort(); // You can define the comparing function here.
    // JS by default uses a crappy string compare.
    // (we use slice to clone the array so the
    // original array won't be modified)
    let results = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + 1] == sorted_arr[i]) {
        results.push(sorted_arr[i]);
      }
    }
    return results;
  }
}
