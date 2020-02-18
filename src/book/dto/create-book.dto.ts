import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  iban: string;

  @ApiProperty({
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  publishedAt: Date;

  @ApiProperty({
    type: [String],
    minItems: 1,
  })
  authors: string[];
}
