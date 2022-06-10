import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { FollowDto } from './dto/follow.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = new UserEntity();
    newUser.name = createUserDto.name;
    newUser.email = createUserDto.email;
    newUser.password = await bcrypt.hash(createUserDto.password, 8);
    try {
      const dbResp = await this.userRepository.save(newUser);
      return { id: dbResp.id, name: dbResp.name, email: dbResp.email };
    } catch (err) {
      if (err.code == '23505') {
        throw new HttpException(
          'Email is already in use',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'Failed to create new user',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async login(loginDto: LoginDto) {
    const findUser = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const check = await bcrypt.compare(loginDto.password, findUser.password);
    if (!check) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }
    const accessToken = await this.jwtService.sign({
      id: findUser.id,
    });
    return { accessToken };
  }

  async follow(followDto: FollowDto, requesterId: number) {
    if (followDto.to == requesterId) {
      throw new HttpException(
        'You can not follow yourself',
        HttpStatus.BAD_REQUEST,
      );
    }
    const requesterProfile = await this.userRepository.findOne({
      where: { id: requesterId },
    });
    const toFollow = await this.userRepository.findOne({
      where: { id: followDto.to },
    });
    if (!toFollow) {
      throw new HttpException(
        'Following id is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      await this.dataSource.transaction(async (entityManager) => {
        await entityManager
          .getRepository(UserEntity)
          .createQueryBuilder()
          .relation(UserEntity, 'following')
          .of(requesterProfile)
          .add(toFollow);
        await entityManager
          .getRepository(UserEntity)
          .createQueryBuilder()
          .relation(UserEntity, 'followers')
          .of(toFollow)
          .add(requesterProfile);
      });
      return {
        status: 'OK',
      };
    } catch (err) {
      if (err.code == '23505') {
        throw new HttpException('Already following', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Error occured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
