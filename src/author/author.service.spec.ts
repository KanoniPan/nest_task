import { Test } from '@nestjs/testing';
import { AuthorService } from './author.service';
import { Author } from './author.entity';
import { ObjectID } from 'mongodb';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book/book.entity';
import { NotFoundException } from '@nestjs/common';

describe('AuthorService', () => {
  let authorService: AuthorService;
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

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthorService,
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

    authorService = moduleRef.get<AuthorService>(AuthorService);
  });

  describe('findAll', () => {
    it('should return an array of authorIds', async () => {
      const result = [
        {
          _id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
          firstName: 'string',
          lastName: 'string',
          birthday: new Date(),
          bookIds: [new ObjectID('5e4be36c48962b7312b2118d')],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(authorRepository, 'find')
        .mockImplementation(async () => await result);

      const res = result[0];

      res.bookIds[0] = res.bookIds[0].toString();
      res._id = res._id.toString();
      await authorService.findAll();
      const expected = await authorRepository.find();
      expect(JSON.stringify(expected[0])).toBe(JSON.stringify(res));
      expect(authorRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create author', async () => {
      const result = {
        _id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
        firstName: 'string',
        lastName: 'string',
        birthday: new Date(),
        bookIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'save')
        .mockImplementation(async () => await result);

      const res = result;
      res._id = res._id.toString();

      const expected = await authorService.create(res);
      expect(expected).toBe(res);
    });
  });

  describe('findOne', () => {
    it('should return an author', async () => {
      const result = {
        _id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
        firstName: 'string',
        lastName: 'string',
        birthday: new Date(),
        bookIds: [new ObjectID('5e4be36c48962b7312b2118d')],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => await result);

      result.bookIds[0] = result.bookIds[0].toString();
      result._id = result._id.toString();
      await authorService.findOne(result._id);
      const expected = await authorRepository.findOneOrFail(result._id);
      expect(JSON.stringify(expected)).toBe(JSON.stringify(result));
      expect(authorRepository.findOneOrFail).toHaveBeenCalledWith(result._id);
    });
  });

  describe('remove', () => {
    it('should remove an author', async () => {
      jest.spyOn(authorRepository, 'delete').mockImplementation();
      jest
        .spyOn(authorService, 'findAuthorOrFail')
        .mockImplementation(async () => author);
      jest
        .spyOn(authorService, 'checkIfBooksExist')
        .mockImplementation(async () => books);
      jest.spyOn(authorService, 'deleteAuthorFromBooks').mockImplementation();
      jest.spyOn(authorRepository, 'delete').mockImplementation();

      await authorService.remove('5e4bd5dc2a30bc700c8b7e9d');

      expect(authorService.findAuthorOrFail).toHaveBeenCalledWith(
        '5e4bd5dc2a30bc700c8b7e9d',
      );
      expect(authorService.checkIfBooksExist).toHaveBeenCalledWith(
        author.bookIds,
      );
      expect(authorService.deleteAuthorFromBooks).toHaveBeenCalledWith(
        books,
        author._id,
      );
      expect(authorRepository.delete).toHaveBeenCalledWith(
        author._id.toString(),
      );
    });
  });

  describe('deleteAuthorFromBooks', () => {
    it('should remove an author from bookIds and authorIds length is >= 1', async () => {
      const authorId = new ObjectID('5e4bd5dc2a30bc700c8b7e9e');

      jest.spyOn(bookRepository, 'save').mockImplementation();
      await authorService.deleteAuthorFromBooks(books, authorId);

      expect(bookRepository.save).toHaveBeenCalled();
    });

    it('should remove an author from bookIds and authorIds length is 0', async () => {
      const authorId = new ObjectID('5e4bd5dc2a30bc700c8b7e9d');

      jest.spyOn(bookRepository, 'delete').mockImplementation();
      await authorService.deleteAuthorFromBooks(books, authorId);

      expect(bookRepository.delete).toHaveBeenCalled();
    });
  });

  describe('checkIfBooksExist', () => {
    it('should check If bookIds exist', async () => {
      const booksIds = ['5e4bd5f32a30bc700c8b7ea1', '5e4bd5f32a30bc700c8b7ea2'];

      jest
        .spyOn(bookRepository, 'findByIds')
        .mockImplementation(async () => books);

      const expected = await authorService.checkIfBooksExist(booksIds);

      expect(bookRepository.findByIds).toHaveBeenCalled();
      expect(expected).toBe(books);
    });

    it('should throw HttpException, because book does not exist', async () => {
      const booksIds = ['5e4bd5f32a3042700c8b7ea5'];

      jest
        .spyOn(bookRepository, 'findByIds')
        .mockImplementation(async () => books);

      try {
        await authorService.checkIfBooksExist(booksIds);
        expect(bookRepository.findByIds).toHaveBeenCalled();
      } catch (e) {
        expect(e.message).toEqual(
          new NotFoundException(
            `Check if Books id's are correct and not a duplicate or Books exist`,
          ).message,
        );
      }
    });
  });

  describe('updateBooks', () => {
    it('should updateBooks', async () => {
      const authorId = ['5e4bd5f32a30bc700c8b7ea4'];

      jest.spyOn(bookRepository, 'update').mockImplementation();

      await authorService.updateBooks(books, authorId);

      expect(bookRepository.update).toHaveBeenCalled();
    });
  });

  describe('findAuthorOrFail', () => {
    it('should find author', async () => {
      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => author);

      const expected = await authorService.findAuthorOrFail(author._id);

      expect(expected).toEqual(author);
    });

    it('should throw error if author does not exist', async () => {
      const authorId = '5e4bd5dc2a30ba700c8b7e2d';

      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => Promise.reject());

      try {
        await authorService.findAuthorOrFail(authorId);
      } catch (e) {
        expect(e.message).toEqual(
          new NotFoundException(`Author with ${authorId} was not found`)
            .message,
        );
      }
    });
  });

  describe('update', () => {
    it('should update only author itself without bookIds', async () => {
      const authorUpdateFields = {
        firstName: 'test',
        lastName: 'test',
        birthday: new Date('February 18, 2020'),
        bookIds: [
          new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
          new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
        ],
      };

      jest
        .spyOn(authorRepository, 'findOneOrFail')
        .mockImplementation(async () => author);

      jest
        .spyOn(authorService, 'checkIfBooksExist')
        .mockImplementation(async () => books);

      jest.spyOn(authorRepository, 'update').mockImplementation();

      await authorService.update(author._id, authorUpdateFields);

      expect(authorRepository.update).toHaveBeenCalled();
    });
  });

  it('should update author and add itself to bookIds he belongs to', async () => {
    const authorUpdateFields = {
      firstName: 'test',
      lastName: 'test',
      birthday: new Date('February 18, 2020'),
      bookIds: [
        new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
        new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
        new ObjectID('5e4bd5f32a30bc700c8b7ea3'),
      ],
    };

    jest
      .spyOn(authorRepository, 'findOneOrFail')
      .mockImplementation(async () => author);

    jest
      .spyOn(authorService, 'checkIfBooksExist')
      .mockImplementation(async () => books);
    jest.spyOn(bookRepository, 'delete').mockImplementation();
    jest.spyOn(bookRepository, 'update').mockImplementation();

    jest.spyOn(authorRepository, 'update').mockImplementation();

    await authorService.update(author._id, authorUpdateFields);

    expect(authorRepository.update).toHaveBeenCalled();
  });

  it('should delete himself from bookIds he does not belong', async () => {
    const authorUpdateFields = {
      firstName: 'test',
      lastName: 'test',
      birthday: new Date('February 18, 2020'),
      bookIds: [
        new ObjectID('5e4bd5f32a30bc700c8b7ea2'),
        new ObjectID('5e4bd5f32a30bc700c8b7ea3'),
      ],
    };

    jest
      .spyOn(authorRepository, 'findOneOrFail')
      .mockImplementation(async () => author);

    jest
      .spyOn(authorService, 'checkIfBooksExist')
      .mockImplementation(async () => books);
    jest.spyOn(bookRepository, 'delete').mockImplementation();
    jest.spyOn(bookRepository, 'update').mockImplementation();

    jest.spyOn(authorRepository, 'update').mockImplementation();

    await authorService.update(author._id, authorUpdateFields);

    expect(authorRepository.update).toHaveBeenCalled();
  });
});
