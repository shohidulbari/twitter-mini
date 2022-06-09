import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'Shohidul Bari',
    description: 'Full name of the user',
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'shohidulbari18@gmail.com',
    description: 'Login email',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'Login password',
  })
  password: string;
}
