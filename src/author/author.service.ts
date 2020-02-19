import { Injectable, NotFoundException } from '@nestjs/common';
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
    author.bookIds = [];
    return this.authorRepository.save(author);
  }

  findOne(id: string): Promise<Author> {
    return this.findAuthorOrFail(id);
  }

  async remove(id: string): Promise<void> {
    const authorToRemove: Author = await this.findAuthorOrFail(id);
    const booksExist: Book[] = await this.checkIfBooksExist(
      authorToRemove.bookIds,
    );
    await this.deleteAuthorFromBooks(booksExist, authorToRemove._id);
    await this.authorRepository.delete(id);
  }

  async update(id: string, author: UpdateAuthorDto): Promise<void> {
    const toUpdate: Author = await this.findAuthorOrFail(id);
    await this.checkIfBooksExist(author.bookIds);

    const authorBooksIds: string[] = author.bookIds?.length
      ? author.bookIds.map(it => it.toString())
      : [];
    const booksExistIds: string[] = toUpdate.bookIds?.length
      ? toUpdate.bookIds.map(it => it.toString())
      : [];

    const authorBooks: string[] = booksExistIds.filter(
      x => !authorBooksIds.includes(x),
    );
    const newBooks: string[] = authorBooksIds.filter(
      x => !booksExistIds.includes(x),
    );

    if (authorBooks.length) {
      const authorsDeleteFromBooks: Book[] = await this.checkIfBooksExist(
        authorBooks,
      );
      await this.deleteAuthorFromBooks(
        authorsDeleteFromBooks,
        new ObjectID(id),
      );
    }

    if (newBooks.length) {
      const authorToUpdate: Book[] = await this.checkIfBooksExist(newBooks);
      await this.updateBooks(authorToUpdate, new ObjectID(id));
    }
    const update: Author = { ...toUpdate, ...author };

    await this.authorRepository.update(id, update);
  }

  async findAuthorOrFail(id: string): Promise<Author> {
    return await this.authorRepository.findOneOrFail(id).catch(() => {
      throw new NotFoundException(`Author with ${id} was not found`);
    });
  }

  async deleteAuthorFromBooks(
    books: Book[],
    authorToRemoveId: ObjectID,
  ): Promise<void> {
    for (const book of books) {
      const bookToUpdate = new Book();
      bookToUpdate.authorIds = book.authorIds.filter(
        author => !author.equals(authorToRemoveId),
      );
      const update: Book = { ...book, ...bookToUpdate };
      if (update.authorIds.length) {
        await this.bookRepository.save(update);
      } else {
        await this.bookRepository.delete(book._id.toString());
      }
    }
  }

  async checkIfBooksExist(books: (string | ObjectID)[]): Promise<Book[]> {
    const ids: string[] = books?.length
      ? books.map(it => new ObjectID(it))
      : [];
    const booksExist: Book[] = await this.bookRepository.findByIds(ids, {});

    if (ids.length !== booksExist.length) {
      throw new NotFoundException(
        `Check if Books id's are correct and not a duplicate or Books exist`,
      );
    }
    return booksExist;
  }

  async updateBooks(books: Book[], authorId: ObjectID): Promise<void> {
    for (const book of books) {
      const bookToUpdate = new Book();
      bookToUpdate.authorIds = book.authorIds
        ? [authorId, ...book.authorIds]
        : [authorId];
      const update: Book = { ...books, ...bookToUpdate };
      await this.bookRepository.update(book._id.toString(), update);
    }
  }
}
