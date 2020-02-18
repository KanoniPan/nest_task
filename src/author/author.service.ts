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
    return this.findAuthorOrFail(id);
  }

  async remove(id: string): Promise<void> {
    const authorsToRemove = await this.findAuthorOrFail(id);
    const booksExist = await this.checkIfBooksExist(authorsToRemove.books);
    await this.deleteAuthorFromBooks(booksExist, authorsToRemove.id);
    await this.authorRepository.delete(id);
  }

  async update(id: string, author: UpdateAuthorDto): Promise<void> {
    const toUpdate = await this.findAuthorOrFail(id);
    await this.checkIfBooksExist(author.books);
    const authorBooksIds = author.books.map(it => it.toString());
    const booksExistIds = toUpdate.books.map(it => it.toString());

    const authorBooks = booksExistIds.filter(x => !authorBooksIds.includes(x));
    const newBooks = authorBooksIds.filter(x => !booksExistIds.includes(x));

    if (authorBooks.length) {
      const authorsDeleteFromBooks = await this.checkIfBooksExist(authorBooks);
      await this.deleteAuthorFromBooks(
        authorsDeleteFromBooks,
        new ObjectID(id),
      );
    }

    if (newBooks.length) {
      const authorToUpdate = await this.checkIfBooksExist(newBooks);
      await this.updateBooks(authorToUpdate, new ObjectID(id));
    }
    const update = { ...toUpdate, ...author };

    await this.authorRepository.update(id, update);
  }

  async findAuthorOrFail(id: string): Promise<Author> {
    return await this.authorRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(
        `Author with ${id} was not found`,
        HttpStatus.NOT_FOUND,
      );
    });
  }

  async deleteAuthorFromBooks(books: Book[], authorToRemoveId: ObjectID) {
    for (const book of books) {
      const bookToUpdate = new Book();
      bookToUpdate.authors = book.authors.filter(
        author => !author.equals(authorToRemoveId),
      );
      const update = { ...book, ...bookToUpdate };
      if (update.authors.length) {
        await this.bookRepository.save(update);
      } else {
        await this.bookRepository.delete(book.id.toString());
      }
    }
  }

  async checkIfBooksExist(books: (string | ObjectID)[]): Promise<Book[]> {
    const ids = books.map(it => new ObjectID(it));
    const booksExist = await this.bookRepository.findByIds(ids, {});

    if (ids.length !== booksExist.length) {
      throw new HttpException(
        `Check if Books id's are correct and not a duplicate or Books exist`,
        HttpStatus.NOT_FOUND,
      );
    }
    return booksExist;
  }

  async updateBooks(books: Book[], authorId: ObjectID) {
    for (const book of books) {
      const bookToUpdate = new Book();
      bookToUpdate.authors = book.authors
        ? [authorId, ...book.authors]
        : [authorId];
      const update = { ...books, ...bookToUpdate };
      await this.bookRepository.update(book.id.toString(), update);
    }
  }
}
