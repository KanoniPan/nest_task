import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Author} from "./crud.entity";
import {AuthorService} from "./crud.service";
import {AuthorController} from "./crud.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Author])],
    providers: [AuthorService],
    controllers: [AuthorController],
})
export class AuthorModule {
}
