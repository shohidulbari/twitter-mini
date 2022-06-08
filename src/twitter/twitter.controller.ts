import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/user/auth.guard';
import { Request } from 'express';

@Controller('twitter')
@UseGuards(AuthGuard)
export class TwitterController {
  @Post('/check')
  async check(@Req() request: Request) {
    console.log(request['requesterId']);
    return 'checked successful';
  }
}
