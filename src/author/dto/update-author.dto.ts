import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAuthorDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  birthday: Date;

  @ApiProperty({
    type: [String],
    minItems: 1,
  })
  @IsOptional()
  bookIds: string[];
}
