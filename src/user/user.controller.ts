import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransformInterceptor } from 'src/transform.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { FollowDto } from './dto/follow.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('user')
@UseInterceptors(new TransformInterceptor())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return await this.userService.login(loginDto);
  }

  @Post('/follow')
  @UseGuards(AuthGuard)
  async follow(@Body() followDto: FollowDto, @Req() request: Request) {
    return await this.userService.follow(followDto, request['requesterId']);
  }
}
