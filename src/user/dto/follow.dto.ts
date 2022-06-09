import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FollowDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'User Id to follow',
  })
  to: number;
}
