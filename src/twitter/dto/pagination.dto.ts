import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    example: 0,
    description: 'Alias offset',
  })
  skip: any;

  @ApiProperty({
    example: 10,
    description: 'Alias limit',
  })
  limit: any;
}
