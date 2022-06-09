import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetEntity } from '../twitter/entity/tweet.entity';
import { EntityManager } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user.module';
import { TwitterModule } from '../twitter/twitter.module';
import * as chai from 'chai';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let entityManager: EntityManager;
  let user1: any;
  let user2: any;

  const user_sample_1: CreateUserDto = {
    name: 'Test User 1',
    email: 't101@gmail.com',
    password: '123456',
  };

  const user_sample_2: CreateUserDto = {
    name: 'Test User 1',
    email: 't102@gmail.com',
    password: '123456',
  };

  const user_sample_3: CreateUserDto = {
    name: 'Test User 1',
    email: 't103@gmail.com',
    password: '123456',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT),
          username: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASS,
          database: process.env.POSTGRES_DB,
          entities: [UserEntity, TweetEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
        UserModule,
        TwitterModule,
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    entityManager = module.get<EntityManager>(EntityManager);

    // insert test user
    user1 = await service.create(user_sample_1);
    user2 = await service.create(user_sample_2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const resp = await service.create(user_sample_3);
    chai.expect(resp.email).to.be.eql(user_sample_3.email);
    await entityManager.getRepository(UserEntity).delete(resp.id);
  });

  it('should login a user and create access token', async () => {
    const resp = await service.login({
      email: user_sample_1.email,
      password: user_sample_1.password,
    });
    chai.expect(resp.accessToken).to.be.a('string');
  });

  it('should follow another user', async () => {
    // user 1 will follow user 2
    const resp = await service.follow(
      {
        to: user2.id,
      },
      user1.id,
    );
    chai.expect(resp.status).to.be.eql('OK');
  });

  afterAll(async () => {
    await entityManager.getRepository(UserEntity).delete(user1.id);
    await entityManager.getRepository(UserEntity).delete(user2.id);
  });
});
