import { Module } from '@nestjs/common';
import {Author} from "./crud/crud.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthorModule} from "./crud/crud.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: 'localhost',
      database: 'my_crud',
      entities: [Author],
      synchronize: true,
    }),
    AuthorModule,
  ],
})
export class AppModule {}
