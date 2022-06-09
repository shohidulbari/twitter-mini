import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
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
