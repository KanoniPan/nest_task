import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { Author } from '../author/author.entity';
import { ObjectID } from 'mongodb';
import { UpdateBookDto } from './dto/update-book.dto';
import { validate, ValidationError } from 'class-validator';

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
      const author: Author = await this.authorRepository
        .findOneOrFail(id)
        .catch(() => {
          throw new NotFoundException(`Author with ${id} was not found`);
        });

      const ids: string[] = author.bookIds.map(it => new ObjectID(it));
      return await this.bookRepository.findByIds(ids);
    }

    return this.bookRepository.find();
  }

  async create(createBookDto: CreateBookDto) {
    const ids: ObjectID[] = createBookDto.authorIds.map(it => new ObjectID(it));
    const authorsExists: Author[] = await this.authorRepository.findByIds(
      ids,
      {},
    );

    if (ids.length !== authorsExists.length) {
      throw new NotFoundException('Check if Author id is correct');
    }

    const book = new Book();

    book.title = createBookDto.title;
    book.iban = createBookDto.iban;
    book.publishedAt = createBookDto.publishedAt;
    book.authorIds = authorsExists.map(it => it._id);

    const errors: ValidationError[] = await validate(book);

    if (errors.length > 0) {
      throw new NotFoundException(errors.map(it => it.constraints));
    }

    const bookToReturn: Book = await this.bookRepository.save(book);
    await this.updateAuthors(authorsExists, bookToReturn._id);

    for (const author of authorsExists) {
      const authorToUpdate = new Author();
      authorToUpdate.bookIds = author.bookIds
        ? [bookToReturn._id, ...author.bookIds]
        : [bookToReturn._id];
      const update: Author = { ...author, ...authorToUpdate };
      await this.authorRepository.save(update);
    }
    return bookToReturn;
  }

  findOne(id: string): Promise<Book> {
    return this.findBookOrFail(id);
  }

  async remove(id: string): Promise<void> {
    const bookToRemove: Book = await this.findBookOrFail(id);

    const authorsExists: Author[] = await this.checkIfAuthorsExist(
      bookToRemove.authorIds,
    );
    await this.deleteBooksFromAuthor(authorsExists, bookToRemove._id);
    await this.bookRepository.delete(id);
  }

  async update(id: string, book: UpdateBookDto): Promise<void> {
    await this.checkIfAuthorsExist(book.authorIds);

    const toUpdate: Book = await this.findBookOrFail(id);

    const bookAuthorsIds: string[] = book.authorIds?.length
      ? book.authorIds.map(it => it.toString())
      : [];
    const authorsExistsIds: string[] = toUpdate.authorIds?.length
      ? toUpdate.authorIds.map(it => it.toString())
      : [];

    const bookAuthors: string[] = authorsExistsIds.filter(
      x => !bookAuthorsIds.includes(x),
    );
    const newAuthors: string[] = bookAuthorsIds.filter(
      x => !authorsExistsIds.includes(x),
    );
    const update: Book = { ...toUpdate, ...book };

    if (bookAuthors.length) {
      const authorsToDelete: Author[] = await this.checkIfAuthorsExist(
        bookAuthors,
      );
      await this.deleteBooksFromAuthor(authorsToDelete, id);
    }
    const bookToReturn: Book = await this.bookRepository.save(update);

    if (newAuthors.length) {
      const authorsToUpdate: Author[] = await this.checkIfAuthorsExist(
        newAuthors,
      );
      await this.updateAuthors(authorsToUpdate, bookToReturn._id);
    }
  }

  async checkIfAuthorsExist(authors: (string | ObjectID)[]): Promise<Author[]> {
    const ids: string[] = authors?.length
      ? authors.map(it => new ObjectID(it))
      : [];
    const authorsExists: Author[] = await this.authorRepository.findByIds(
      ids,
      {},
    );

    if (ids.length !== authorsExists.length) {
      throw new NotFoundException(
        'Check if Author id is correct or it is not a duplicate',
      );
    }
    return authorsExists;
  }

  async updateAuthors(authors: Author[], bookId: ObjectID) {
    for (const author of authors) {
      const authorToUpdate = new Author();
      authorToUpdate.bookIds = author.bookIds
        ? [bookId, ...author.bookIds]
        : [bookId];
      const update: Author = { ...author, ...authorToUpdate };
      await this.authorRepository.save(update);
    }
  }

  async deleteBooksFromAuthor(
    authorsExists: Author[],
    bookToRemoveId: ObjectID,
  ) {
    for (const author of authorsExists) {
      const authorToUpdate = new Author();
      authorToUpdate.bookIds = author.bookIds.filter(
        (book: ObjectID) => !book.equals(bookToRemoveId),
      );
      const update: Author = { ...author, ...authorToUpdate };
      await this.authorRepository.save(update);
    }
  }

  async findBookOrFail(id: string): Promise<Book> {
    return this.bookRepository.findOneOrFail(id).catch(() => {
      throw new BadRequestException(`Book with ${id} was not found`);
    });
  }
}
