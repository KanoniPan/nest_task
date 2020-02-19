import { Test } from '@nestjs/testing';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { Author } from './author.entity';
import { ObjectID } from 'mongodb';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book/book.entity';

describe('AuthorController', () => {
  let authorController: AuthorController;
  let authorService: AuthorService;
  const author = {
    id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
    firstName: 'string',
    lastName: 'string',
    birthday: new Date(),
    books: [new ObjectID('5e4be36c48962b7312b2118d')],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthorController],
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

    authorService = moduleRef.get<AuthorService>(AuthorService);
    authorController = moduleRef.get<AuthorController>(AuthorController);
  });

  describe('findAll', () => {
    it('should return an array of authors', async () => {
      const authors = [
        {
          id: new ObjectID('5e4bd5dc2a30bc700c8b7e9d'),
          firstName: 'string',
          lastName: 'string',
          birthday: new Date(),
          books: [new ObjectID('5e4be36c48962b7312b2118d')],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(authorService, 'findAll')
        .mockImplementation(async () => await authors);

      const res = authors[0];

      res.books[0] = res.books[0].toString();
      res.id = res.id.toString();
      const expected = await authorController.findAll();
      expect(JSON.stringify(expected[0])).toBe(JSON.stringify(res));
    });
  });

  describe('findOne', () => {
    it('should return an author', async () => {
      jest
        .spyOn(authorService, 'findOne')
        .mockImplementation(async () => await author);
      // const res = classToPlain(author);

      author.books = author.books[0].toString();
      author.id = author.id.toString();
      const expected = await authorController.findOne(
        '5e4bd5dc2a30bc700c8b7e9d',
      );
      expect(JSON.stringify(expected)).toBe(JSON.stringify(author));
    });
  });

  describe('create', () => {
    it('should create an author', async () => {
      jest
        .spyOn(authorService, 'create')
        .mockImplementation(async () => await author);

      author.books = author.books[0].toString();
      author.id = author.id.toString();
      const expected = await authorController.create(author);
      expect(JSON.stringify(expected)).toBe(JSON.stringify(author));
    });
  });

  describe('delete', () => {
    it('should delete an author', async () => {
      jest.spyOn(authorService, 'remove').mockImplementation();
      const id = '5e4bd5dc2a30bc700c8b7e9d';

      await authorController.remove(id);

      expect(authorService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('delete', () => {
    it('should update an author', async () => {
      jest.spyOn(authorService, 'update').mockImplementation();

      await authorController.update(author.id, author);

      expect(authorService.update).toHaveBeenCalledWith(author.id, author);
    });
  });
});
