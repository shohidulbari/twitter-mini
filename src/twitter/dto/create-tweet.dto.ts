import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTweetDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Hey, This is my first tweet at twitter.',
    description: 'tweet body',
  })
  body: string;
}
