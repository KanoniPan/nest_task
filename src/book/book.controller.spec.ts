import { Test } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Author } from '../author/author.entity';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;
  const book = {
    _id: new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
    title: 'test_test',
    iban: 'IBANBANBANBANBAN',
    publishedAt: new Date(),
    authorIds: [new ObjectID('5e4bd5dd2a30bc700c8b7e9e')],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const books = [
    {
      _id: new ObjectID('5e4bd5f32a30bc700c8b7ea1'),
      title: 'test_test',
      iban: 'IBANBANBANBANBAN',
      publishedAt: new Date(),
      authorIds: [new ObjectID('5e4bd5dd2a30bc700c8b7e9e')],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BookController],
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

    bookService = moduleRef.get<BookService>(BookService);
    bookController = moduleRef.get<BookController>(BookController);
  });

  describe('findAll', () => {
    it('should return an array of bookIds', async () => {
      jest.spyOn(bookService, 'findAll').mockImplementation(async () => books);

      const res = books[0];

      res.authorIds[0] = res.authorIds[0].toString();
      res._id = res._id.toString();
      const expected = await bookController.findAll();

      expect(JSON.stringify(expected[0])).toBe(JSON.stringify(res));
    });

    it('should return an array of bookIds filtered by Author', async () => {
      jest.spyOn(bookService, 'findAll').mockImplementation(async () => books);

      const res = books[0];

      res.authorIds[0] = res.authorIds[0].toString();
      res._id = res._id.toString();
      const expected = await bookController.findAll('5e4bd5f32a30bc700c8b7ea1');

      expect(JSON.stringify(expected[0])).toBe(JSON.stringify(res));
      expect(bookService.findAll).toHaveBeenCalledWith(
        '5e4bd5f32a30bc700c8b7ea1',
      );
    });
  });

  describe('findOne', () => {
    it('should return a book', async () => {
      jest.spyOn(bookService, 'findOne').mockImplementation(async () => book);

      book.authorIds = book.authorIds[0].toString();
      book._id = book._id.toString();
      const expected = await bookController.findOne('5e4bd5f32a30bc700c8b7ea1');

      expect(JSON.stringify(expected)).toBe(JSON.stringify(book));
    });
  });

  describe('create', () => {
    it('should create a book', async () => {
      jest.spyOn(bookService, 'create').mockImplementation(async () => book);

      book.authorIds = book.authorIds[0].toString();
      book._id = book._id.toString();
      const expected = await bookController.create(book);

      expect(JSON.stringify(expected)).toBe(JSON.stringify(book));
    });
  });

  describe('delete', () => {
    it('should delete a book', async () => {
      jest.spyOn(bookService, 'remove').mockImplementation();
      const _id = '5e4bd5f32a30bc700c8b7ea1';

      await bookController.remove(_id);

      expect(bookService.remove).toHaveBeenCalledWith(_id);
    });
  });

  describe('delete', () => {
    it('should update an author', async () => {
      jest.spyOn(bookService, 'update').mockImplementation();

      await bookController.update(book._id, book);

      expect(bookService.update).toHaveBeenCalledWith(book._id, book);
    });
  });
});
