import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { IsDateString } from 'class-validator';

@Entity()
export class Author {
  @ObjectIdColumn()
  @Transform(value => value.toString(), { toPlainOnly: true })
  _id: ObjectID;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @IsDateString()
  birthday: Date;

  @Exclude()
  @CreateDateColumn()
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    default: [],
  })
  @Transform(value => value.map(it => it.toString()), { toPlainOnly: true })
  bookIds?: (string | ObjectID)[];
}
