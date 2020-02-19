import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectID } from 'typeorm';

export class UpdateBookDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  iban: string;

  @ApiProperty({
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  publishedAt: Date | string;

  @ApiProperty({
    type: [String],
    minItems: 1,
  })
  @IsOptional()
  authors: ObjectID[];
}
