import { Test } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookService } from './book.service';
import { Author } from '../author/author.entity';

describe('BookService', () => {
  let bookService: BookService;
  let authorRepository: Repository<Author>;
  let bookRepository: Repository<Book>;
  const books = [
    {
      _id: new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
      title: 'test_test',
      iban: 'IBANBANBANBANBAN',
      publishedAt: new Date(),
      authorIds: [new ObjectID('5e4bd5dc2a30bc700c8b7e9d')],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
      title: 'test_test',
      iban: 'IBANBANBANBANBAN',
      publishedAt: new Date(),
      authorIds: [new ObjectID('5e4bd5dc2a30bc700c8b7e9d')],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const book = {
    _id: new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
    title: 'test_test',
    iban: 'IBANBANBANBANBAN',
    publishedAt: new Date(),
    authorIds: [
      new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
      new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const author = {
    _id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
    firstName: 'string',
    lastName: 'string',
    birthday: new Date(),
    bookIds: [
      new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
      new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const authors = [
    {
      _id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
      firstName: 'string',
      lastName: 'string',
      birthday: new Date(),
      bookIds: [
        new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
        new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
      firstName: 'test',
      lastName: 'test',
      birthday: new Date(),
      bookIds: [
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
    it('should return an array of bookIds', async () => {
      jest.spyOn(bookRepository, 'find').mockImplementation(async () => books);

      const res = books[0];

      res.authorIds[0] = res.authorIds[0].toString();
      res._id = res._id.toString();
      await bookService.findAll();
      const expected = await bookRepository.find();
      expect(JSON.stringify(expected[0])).toBe(JSON.stringify(res));
      expect(bookRepository.find).toHaveBeenCalled();
    });

    it('should return an array of bookIds by author Id', async () => {
      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => author);
      jest
        .spyOn(bookRepository, 'findByIds')
        .mockImplementation(async () => books);
      const authorId = '5e4bd5dc2a30bc700c8b7e9d';

      await bookService.findAll(authorId);

      expect(bookRepository.findByIds).toHaveBeenCalledWith(
        author.bookIds.map(it => new ObjectID(it)),
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
        expect(e.message).toEqual(
          new NotFoundException(`Author with ${authorId} was not found`)
            .message,
        );
      }
    });
  });

  describe('create', () => {
    it('should create book', async () => {
      const bookToCreate = {
        _id: '5e4bd5f32a30bc700c8b7ea1',
        title: 'test_test',
        iban: 'IBANBANBANBANBAN',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authorIds: ['5e4bd5dc2a30bc700c8b7e9d', '5e4bd5dc2a30bc700c8b7e9e'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findByIds')
        .mockImplementation(async () => authors);
      jest.spyOn(bookRepository, 'save').mockImplementation(async () => book);
      jest.spyOn(bookService, 'updateAuthors').mockImplementation();
      jest.spyOn(authorRepository, 'save').mockImplementation();

      await bookService.create(bookToCreate);

      expect(authorRepository.save).toHaveBeenCalled();
    });

    it('should throw HttpException, because one of the authorIds do not exist', async () => {
      const bookToCreate = {
        _id: '5e4bd5f32a30bc700c8b7ea1',
        title: 'test_test',
        iban: 'IBANBANBANBANBAN',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authorIds: ['5e4bd5dc2a30bc700c8b7e9d'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findByIds')
        .mockImplementation(async () => authors);

      try {
        await bookService.create(bookToCreate);
      } catch (e) {
        expect(e.message).toEqual(
          new NotFoundException('Check if Author id is correct').message,
        );
      }
    });

    it('should throw HttpException when validation fails', async () => {
      const bookToCreate = {
        _id: '5e4bd5f32a30bc700c8b7ea1',
        title: 'test_test',
        iban: 'iban',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authorIds: ['5e4bd5dc2a30bc700c8b7e9d', '5e4bd5dc2a30bc700c8b7e9e'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findByIds')
        .mockImplementation(async () => authors);
      jest.spyOn(bookRepository, 'save').mockImplementation(async () => book);
      try {
        await bookService.create(bookToCreate);
      } catch (e) {
        expect(e.message).toStrictEqual(
          new NotFoundException(e.message).message,
        );
      }
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      jest
        .spyOn(bookRepository, 'findOneOrFail')
        .mockImplementation(async () => book);

      book.authorIds[0] = book.authorIds[0].toString();
      book._id = book._id.toString();
      await bookService.findOne(book._id);
      const expected = await bookRepository.findOneOrFail(book._id);
      expect(JSON.stringify(expected)).toBe(JSON.stringify(book));
      expect(bookRepository.findOneOrFail).toHaveBeenCalledWith(book._id);
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
        book.authorIds,
      );
      expect(bookService.deleteBooksFromAuthor).toHaveBeenCalledWith(
        authors,
        book._id,
      );
      expect(bookRepository.delete).toHaveBeenCalledWith(book._id.toString());
    });
  });

  describe('deleteBooksFromAuthor', () => {
    it('should remove bookIds from authorIds', async () => {
      const bookId = new ObjectID('5e4bd5f32a30bc700c8b7ea2');

      jest.spyOn(authorRepository, 'save').mockImplementation();
      await bookService.deleteBooksFromAuthor(authors, bookId);

      expect(authorRepository.save).toHaveBeenCalled();
    });

    describe('checkIfAuthorsExist', () => {
      it('should check if authorIds exist', async () => {
        const authorIds = [
          '5e4bd5dc2a30bc700c8b7e9d',
          '5e4bd5dc2a30bc700c8b7e9e',
        ];

        jest
          .spyOn(authorRepository, 'findByIds')
          .mockImplementation(async () => await authors);

        const expected = await bookService.checkIfAuthorsExist(authorIds);

        expect(authorRepository.findByIds).toHaveBeenCalled();
        expect(expected).toBe(authors);
      });

      it('should throw HttpException, because one of the authorIds do not exist', async () => {
        const booksIds = ['5e4bd5dc2a30bc700c8b7e91'];

        jest
          .spyOn(authorRepository, 'findByIds')
          .mockImplementation(async () => await authors);

        try {
          await bookService.checkIfAuthorsExist(booksIds);
          expect(authorRepository.findByIds).toHaveBeenCalled();
        } catch (e) {
          expect(e.message).toEqual(
            new NotFoundException(
              'Check if Author id is correct or it is not a duplicate',
            ).message,
          );
        }
      });
    });

    describe('updateAuthors', () => {
      it('should updateAuthors', async () => {
        const bookId = ['5e4bd5f32a30bc700c8b7ea2'];

        jest.spyOn(authorRepository, 'save').mockImplementation();

        await bookService.updateAuthors(authors, bookId);

        expect(authorRepository.save).toHaveBeenCalled();
      });
    });

    describe('findBookOrFail', () => {
      it('should find book', async () => {
        jest
          .spyOn(bookRepository, 'findOneOrFail')
          .mockImplementation(async () => book);

        const expected = await bookService.findBookOrFail(author._id);

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
          expect(e.message).toEqual(
            new BadRequestException(`Book with ${bookId} was not found`)
              .message,
          );
        }
      });
    });
  });

  describe('update', () => {
    it('should update only book itself without authorIds', async () => {
      const bookUpdateFields = {
        title: 'test',
        iban: 'ibananbana',
        publishedAt: '2020-02-18T10:49:32.954Z',
        authorIds: [
          new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
          new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(bookService, 'checkIfAuthorsExist')
        .mockImplementation(async () => authors);
      jest
        .spyOn(bookService, 'findBookOrFail')
        .mockImplementation(async () => book);
      jest.spyOn(authorRepository, 'update').mockImplementation();
      jest.spyOn(bookRepository, 'save').mockImplementation();

      await bookService.update(book._id, bookUpdateFields);

      expect(bookRepository.save).toHaveBeenCalled();
    });
  });

  it('should update book and add itself to authorIds he belongs to', async () => {
    const bookUpdateFields = {
      title: 'test',
      iban: 'ibananbana',
      publishedAt: '2020-02-18T10:49:32.954Z',
      authorIds: [
        new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
        new ObjectID('5e4bd5dc2a30bc700c8b7e9e'),
        new ObjectID('5e4bdf2d3cb9ea71a8c4d304'),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest
      .spyOn(bookService, 'checkIfAuthorsExist')
      .mockImplementation(async () => authors);
    jest
      .spyOn(bookService, 'findBookOrFail')
      .mockImplementation(async () => book);
    jest.spyOn(authorRepository, 'update').mockImplementation();
    jest.spyOn(bookService, 'updateAuthors').mockImplementation();
    jest
      .spyOn(bookRepository, 'save')
      .mockImplementation()
      .mockImplementation(async () => book);
    await bookService.update(book._id, bookUpdateFields);

    expect(bookRepository.save).toHaveBeenCalled();
  });

  it('should delete himself from authorIds he does not belong', async () => {
    const bookUpdateFields = {
      title: 'test',
      iban: 'ibananbana',
      publishedAt: '2020-02-18T10:49:32.954Z',
      authorIds: [new ObjectID('5e4bd5dc2a30bc700c8b7e9d')],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest
      .spyOn(bookService, 'checkIfAuthorsExist')
      .mockImplementation(async () => authors);
    jest
      .spyOn(bookService, 'findBookOrFail')
      .mockImplementation(async () => book);
    jest.spyOn(authorRepository, 'update').mockImplementation();
    jest.spyOn(bookService, 'deleteBooksFromAuthor').mockImplementation();
    jest
      .spyOn(bookRepository, 'save')
      .mockImplementation()
      .mockImplementation(async () => book);

    await bookService.update(book._id, bookUpdateFields);

    expect(bookRepository.save).toHaveBeenCalled();
  });
});
