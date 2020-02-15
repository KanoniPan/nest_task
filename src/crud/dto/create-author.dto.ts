import { ApiProperty } from '@nestjs/swagger';
import {IsDate, IsString} from "class-validator";
import {Type} from "class-transformer";

export class CreateAuthorDto {
    @ApiProperty({
        type: String
    })
    @IsString()
    firstName: string;
    @ApiProperty({
        type: String
    })
    @IsString()
    lastName: string;
    @ApiProperty({
        type: Date
    })
    @IsDate()
    @Type(() => Date)
    birthday: Date;
}
