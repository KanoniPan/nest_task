import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Max, Min } from "class-validator";

@Entity()
export class Book {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  title: string;

  @Min(16)
  @Max(34)
  @Column()
  iban: string;

  @Column()
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
  @Column()
  authors: ObjectID[];
}
