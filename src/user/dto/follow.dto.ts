import { IsNotEmpty } from 'class-validator';

export class FollowDto {
  @IsNotEmpty()
  to: number;
}
