import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { Author } from '../author/author.entity';
import { ObjectID } from 'mongodb';
import { UpdateBookDto } from './dto/update-book.dto';
import { validate } from 'class-validator';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  async findAll(id?: string): Promise<Book[]> {
    if (id) {
      const author = await this.authorRepository.findOneOrFail(id).catch(() => {
        throw new HttpException(
          `Author with ${id} was not found`,
          HttpStatus.NOT_FOUND,
        );
      });

      const ids = author.books.map(it => new ObjectID(it));
      const booksToReturn = await this.bookRepository.findByIds(ids);

      return booksToReturn;
    }

    return this.bookRepository.find();
  }

  async create(createBookDto: CreateBookDto) {
    const ids = createBookDto.authors.map(it => new ObjectID(it));
    const authorsExists = await this.authorRepository.findByIds(ids, {});

    if (ids.length !== authorsExists.length) {
      throw new HttpException(
        `Check if Author id is correct`,
        HttpStatus.NOT_FOUND,
      );
    }

    const book = new Book();

    book.title = createBookDto.title;
    book.iban = createBookDto.iban;
    book.publishedAt = createBookDto.publishedAt;
    book.authors = authorsExists.map(it => it.id);

    const errors = await validate(book);

    if (errors.length > 0) {
      throw new HttpException(
        errors.map(it => it.constraints),
        HttpStatus.NOT_FOUND,
      );
    }

    const bookToReturn = await this.bookRepository.save(book);
    await this.updateAuthor(authorsExists, bookToReturn.id);

    for (const author of authorsExists) {
      const authorToUpdate = new Author();
      authorToUpdate.books = author.books
        ? [bookToReturn.id, ...author.books]
        : [bookToReturn.id];
      const update = { ...author, ...authorToUpdate };
      await this.authorRepository.save(update);
    }
    return bookToReturn;
  }

  findOne(id: string): Promise<Book> {
    return this.findBookOrFail(id);
  }

  async remove(id: string): Promise<void> {
    const bookToRemove = await this.findBookOrFail(id);

    const authorExists = await this.checkIfAuthorsExists(bookToRemove.authors);
    await this.deleteBooksFromAuthor(authorExists, bookToRemove.id);
    await this.bookRepository.delete(id);
  }

  // TODO: - rename differenceLeft, differenceRight
  async update(id: string, book: UpdateBookDto): Promise<void> {
    await this.checkIfAuthorsExists(book.authors);

    const toUpdate = await this.findBookOrFail(id);

    const bookAuthorsIds = book.authors.map(it => it.toString());
    const authorsExistsIds = toUpdate.authors.map(it => it.toString());

    const bookAuthors = authorsExistsIds.filter(
      x => !bookAuthorsIds.includes(x),
    );
    const newAuthors = bookAuthorsIds.filter(
      x => !authorsExistsIds.includes(x),
    );
    const update = { ...toUpdate, ...book };

    if (bookAuthors.length) {
      const authorsToDelete = await this.checkIfAuthorsExists(bookAuthors);
      await this.deleteBooksFromAuthor(authorsToDelete, id);
    }
    const bookToReturn = await this.bookRepository.save(update);

    if (newAuthors.length) {
      const authorToUpdate = await this.checkIfAuthorsExists(newAuthors);
      await this.updateAuthor(authorToUpdate, bookToReturn.id);
    }
  }

  async checkIfAuthorsExists(
    authors: (string | ObjectID)[],
  ): Promise<Author[]> {
    const ids = authors.map(it => new ObjectID(it));
    const authorsExists = await this.authorRepository.findByIds(ids, {});

    if (ids.length !== authorsExists.length) {
      throw new HttpException(
        `Check if Author id is correct or it is not a duplicate`,
        HttpStatus.NOT_FOUND,
      );
    }
    return authorsExists;
  }

  async updateAuthor(authors: Author[], bookId: ObjectID) {
    for (const author of authors) {
      const authorToUpdate = new Author();
      authorToUpdate.books = author.books
        ? [bookId, ...author.books]
        : [bookId];
      const update = { ...author, ...authorToUpdate };
      await this.authorRepository.save(update);
    }
  }

  async deleteBooksFromAuthor(
    authorsExists: Author[],
    bookToRemoveId: ObjectID,
  ) {
    for (const author of authorsExists) {
      const authorToUpdate = new Author();
      authorToUpdate.books = author.books.filter(
        book => !book.equals(bookToRemoveId),
      );
      const update = { ...author, ...authorToUpdate };
      await this.authorRepository.save(update);
    }
  }

  findBookOrFail(id: string): Promise<Book> {
    return this.bookRepository.findOneOrFail(id).catch(() => {
      throw new HttpException(
        `Book with ${id} was not found`,
        HttpStatus.BAD_REQUEST,
      );
    });
  }
}
