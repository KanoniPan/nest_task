import { Test } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book/book.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BookService } from './book.service';
import { Author } from '../author/author.entity';

describe('BookService', () => {
  let bookService: BookService;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  const books = [
    {
      id: new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
      title: 'test_test',
      iban: 'IBANBANBANBANBAN',
      publishedAt: new Date(),
      authors: [new ObjectID('5e4bd5dc2a30bc700c8b7e9d')],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
      title: 'test_test',
      iban: 'IBANBANBANBANBAN',
      publishedAt: new Date(),
      authors: [new ObjectID('5e4bd5dc2a30bc700c8b7e9d')],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const book = {
    id: new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
    title: 'test_test',
    iban: 'IBANBANBANBANBAN',
    publishedAt: new Date(),
    authors: [
      new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
      new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const author = {
    id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
    firstName: 'string',
    lastName: 'string',
    birthday: new Date(),
    books: [
      new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
      new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const authors = [
    {
      id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
      firstName: 'string',
      lastName: 'string',
      birthday: new Date(),
      books: [
        new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
        new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
      firstName: 'test',
      lastName: 'test',
      birthday: new Date(),
      books: [
        new ObjectID('5e4bd5f32a30bc700c8b7ea4'),
        new ObjectID('5e4bd5f32a30bc700c8b7ea5'),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Author),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
      ],
    }).compile();
    authorRepository = moduleRef.get<Repository<Author>>(
      getRepositoryToken(Author),
    );
    bookRepository = moduleRef.get<Repository<Book>>(getRepositoryToken(Book));

    bookService = moduleRef.get<BookService>(BookService);
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      jest
        .spyOn(bookRepository, 'find')
        .mockImplementation(async () => await books);

      const res = books[0];

      res.authors[0] = res.authors[0].toString();
      res.id = res.id.toString();
      await bookService.findAll();
      const expected = await bookRepository.find();
      expect(JSON.stringify(expected[0])).toBe(JSON.stringify(res));
      expect(bookRepository.find).toHaveBeenCalled();
    });

    it('should return an array of books by author Id', async () => {
      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => await author);
      jest
        .spyOn(bookRepository, 'findByIds')
        .mockImplementation(async () => await books);
      const authorId = '5e4bd5dc2a30bc700c8b7e9d';

      await bookService.findAll(authorId);

      expect(bookRepository.findByIds).toHaveBeenCalledWith(
        author.books.map(it => new ObjectID(it)),
      );
    });

    it('should throw HttpException, because one of the author does not exist', async () => {
      const authorId = '5e4bd5dc2a30bc700c8b7e9d';

      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => Promise.reject());

      try {
        await bookService.findAll(authorId);
      } catch (e) {
        await expect(e).toEqual(
          new HttpException(
            `Author with ${authorId} was not found`,
            HttpStatus.NOT_FOUND,
          ),
        );
      }
    });
  });

  describe('create', () => {
    it('should create book', async () => {
      const bookToCreate = {
        id: '5e4bd5f32a30bc700c8b7ea1',
        title: 'test_test',
        iban: 'IBANBANBANBANBAN',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authors: ['5e4bd5dc2a30bc700c8b7e9d', '5e4bd5dc2a30bc700c8b7e9e'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findByIds')
        .mockImplementation(async () => await authors);
      jest
        .spyOn(bookRepository, 'save')
        .mockImplementation(async () => await book);
      jest.spyOn(bookService, 'updateAuthor').mockImplementation();
      jest.spyOn(authorRepository, 'save').mockImplementation();

      await bookService.create(bookToCreate);

      await expect(authorRepository.save).toHaveBeenCalled;
    });

    it('should throw HttpException, because one of the authors do not exist', async () => {
      const bookToCreate = {
        id: '5e4bd5f32a30bc700c8b7ea1',
        title: 'test_test',
        iban: 'IBANBANBANBANBAN',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authors: ['5e4bd5dc2a30bc700c8b7e9d'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findByIds')
        .mockImplementation(async () => await authors);

      try {
        await bookService.create(bookToCreate);
      } catch (e) {
        expect(e).toEqual(
          new HttpException(
            'Check if Author id is correct',
            HttpStatus.NOT_FOUND,
          ),
        );
      }
    });

    it('should throw HttpException when validation fails', async () => {
      const bookToCreate = {
        id: '5e4bd5f32a30bc700c8b7ea1',
        title: 'test_test',
        iban: 'iban',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authors: ['5e4bd5dc2a30bc700c8b7e9d', '5e4bd5dc2a30bc700c8b7e9e'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findByIds')
        .mockImplementation(async () => await authors);
      jest
        .spyOn(bookRepository, 'save')
        .mockImplementation(async () => await book);
      try {
        await bookService.create(bookToCreate);
      } catch (e) {
        expect(e).toStrictEqual(
          new HttpException(e.message, HttpStatus.NOT_FOUND),
        );
      }
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      jest
        .spyOn(bookRepository, 'findOneOrFail')
        .mockImplementation(async () => await book);

      book.authors[0] = book.authors[0].toString();
      book.id = book.id.toString();
      await bookService.findOne(book.id);
      const expected = await bookRepository.findOneOrFail(book.id);
      expect(JSON.stringify(expected)).toBe(JSON.stringify(book));
      expect(bookRepository.findOneOrFail).toHaveBeenCalledWith(book.id);
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      jest.spyOn(authorRepository, 'delete').mockImplementation();
      jest
        .spyOn(bookService, 'findBookOrFail')
        .mockImplementation(async () => await book);
      jest
        .spyOn(bookService, 'checkIfAuthorsExist')
        .mockImplementation(async () => await authors);
      jest.spyOn(bookService, 'deleteBooksFromAuthor').mockImplementation();
      jest.spyOn(bookRepository, 'delete').mockImplementation();

      await bookService.remove('5e4bd5f32a30bc700c8b7ea1');

      expect(bookService.findBookOrFail).toHaveBeenCalledWith(
        '5e4bd5f32a30bc700c8b7ea1',
      );
      expect(bookService.checkIfAuthorsExist).toHaveBeenCalledWith(
        book.authors,
      );
      expect(bookService.deleteBooksFromAuthor).toHaveBeenCalledWith(
        authors,
        book.id,
      );
      expect(bookRepository.delete).toHaveBeenCalledWith(book.id.toString());
    });
  });

  describe('deleteBooksFromAuthor', () => {
    it('should remove books from authors', async () => {
      const bookId = new ObjectID('5e4bd5f32a30bc700c8b7ea2');

      jest.spyOn(authorRepository, 'save').mockImplementation();
      await bookService.deleteBooksFromAuthor(authors, bookId);

      await expect(authorRepository.save).toHaveBeenCalled();
    });

    describe('checkIfAuthorsExist', () => {
      it('should check if authors exist', async () => {
        const authorIds = [
          '5e4bd5dc2a30bc700c8b7e9d',
          '5e4bd5dc2a30bc700c8b7e9e',
        ];

        jest
          .spyOn(authorRepository, 'findByIds')
          .mockImplementation(async () => await authors);

        const expected = await bookService.checkIfAuthorsExist(authorIds);

        await expect(authorRepository.findByIds).toHaveBeenCalled();
        await expect(expected).toBe(authors);
      });

      it('should throw HttpException, because one of the authors do not exist', async () => {
        const booksIds = ['5e4bd5dc2a30bc700c8b7e91'];

        jest
          .spyOn(authorRepository, 'findByIds')
          .mockImplementation(async () => await authors);

        try {
          await bookService.checkIfAuthorsExist(booksIds);
          await expect(authorRepository.findByIds).toHaveBeenCalled();
        } catch (e) {
          await expect(e).toEqual(
            new HttpException(
              `Check if Author id is correct or it is not a duplicate`,
              HttpStatus.NOT_FOUND,
            ),
          );
        }
      });
    });

    describe('updateAuthor', () => {
      it('should updateAuthor', async () => {
        const bookId = ['5e4bd5f32a30bc700c8b7ea2'];

        jest.spyOn(authorRepository, 'save').mockImplementation();

        await bookService.updateAuthor(authors, bookId);

        await expect(authorRepository.save).toHaveBeenCalled();
      });
    });

    describe('findBookOrFail', () => {
      it('should find book', async () => {
        jest
          .spyOn(bookRepository, 'findOneOrFail')
          .mockImplementation(async () => await book);

        const expected = await bookService.findBookOrFail(author.id);

        await expect(expected).toEqual(book);
      });

      it('should throw error if book does not exist', async () => {
        const bookId = '5e4bd5f32a30bc700c8b7ea2';

        jest
          .spyOn(bookRepository, 'findOneOrFail')
          .mockImplementation(async () => Promise.reject());

        try {
          await bookService.findBookOrFail(bookId);
        } catch (e) {
          await expect(e).toEqual(
            new HttpException(
              `Book with ${bookId} was not found`,
              HttpStatus.NOT_FOUND,
            ),
          );
        }
      });
    });
  });

  describe('update', () => {
    it('should update only book itself without authors', async () => {
      const bookUpdateFields = {
        title: 'test',
        iban: 'ibananbana',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authors: [
          new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
          new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(bookService, 'checkIfAuthorsExist')
        .mockImplementation(async () => await authors);
      jest
        .spyOn(bookService, 'findBookOrFail')
        .mockImplementation(async () => await book);
      jest.spyOn(authorRepository, 'update').mockImplementation();
      jest.spyOn(bookRepository, 'save').mockImplementation();

      await bookService.update(book.id, bookUpdateFields);

      expect(bookRepository.save).toHaveBeenCalled();
    });
  });

  it('should update book and add itself to authors he belongs to', async () => {
    const bookUpdateFields = {
      title: 'test',
      iban: 'ibananbana',
      publishedAt: '2020-02-18T10:49:32.954Z',
      authors: [
        new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
        new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
        new ObjectID('5e4bdf2d3cb9ea71a8c4d304'),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest
      .spyOn(bookService, 'checkIfAuthorsExist')
      .mockImplementation(async () => await authors);
    jest
      .spyOn(bookService, 'findBookOrFail')
      .mockImplementation(async () => await book);
    jest.spyOn(authorRepository, 'update').mockImplementation();
    jest.spyOn(bookService, 'updateAuthor').mockImplementation();
    jest
      .spyOn(bookRepository, 'save')
      .mockImplementation()
      .mockImplementation(async () => await book);
    await bookService.update(book.id, bookUpdateFields);

    expect(bookRepository.save).toHaveBeenCalled();
  });

  it('should delete himself from authors he does not belong', async () => {
    const bookUpdateFields = {
      title: 'test',
      iban: 'ibananbana',
      publishedAt: '2020-02-18T10:49:32.954Z',
      authors: [new ObjectID('5e4bd5dc2a30bc700c8b7e9d')],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest
      .spyOn(bookService, 'checkIfAuthorsExist')
      .mockImplementation(async () => await authors);
    jest
      .spyOn(bookService, 'findBookOrFail')
      .mockImplementation(async () => await book);
    jest.spyOn(authorRepository, 'update').mockImplementation();
    jest.spyOn(bookService, 'deleteBooksFromAuthor').mockImplementation();
    jest
      .spyOn(bookRepository, 'save')
      .mockImplementation()
      .mockImplementation(async () => await book);

    await bookService.update(book.id, bookUpdateFields);

    expect(bookRepository.save).toHaveBeenCalled();
  });
});
