import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTweetDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
