import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from 'src/transform.interceptor';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserService } from './user.service';

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
}
