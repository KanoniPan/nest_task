import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { Length, IsDateString } from 'class-validator';

@Entity()
export class Book {
  @ObjectIdColumn()
  @Transform(value => value.toString(), { toPlainOnly: true })
  id: ObjectID;

  @Column()
  title: string;

  @Column()
  @Length(16, 34)
  iban: string;

  @Column()
  @IsDateString()
  publishedAt: Date | string;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Transform(value => value.map(it => it.toString()), { toPlainOnly: true })
  authors: ObjectID[];
}
