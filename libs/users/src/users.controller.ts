import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  OmitType,
} from '@nestjs/swagger';

import { CurrentUser, Role, Roles } from '@deliveryapp/common';
import {
  BaseResponse,
  BaseResponseSerializerInterceptor,
  CreateUserDto,
  ErrorsInterceptor,
  JwtAuthGuard,
  PasswordDto,
  RolesGuard,
  SequelizeQueryPipe,
  TransformPipe,
  UpdateProfileDto,
  UpdateUserDto,
  User,
  UserDto,
  UsersDto,
  ValidationErrorPipe,
} from '@deliveryapp/core';

import { UsersQuery } from './users.query';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ErrorsInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/self
   */
  @Get('self')
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns authenticated user',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@CurrentUser() user: Partial<User>): Promise<User> {
    const profile = await this.usersService.findProfile(user);
    return new UserDto(profile);
  }

  /**
   * PATCH /users/self
   */
  @Patch('self')
  @ApiOperation({ summary: 'Update authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ID of updated user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
  })
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @Body() userDto: UpdateProfileDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.usersService.updateProfile(user.id, userDto, user);
  }

  /**
   * PATCH /users/self/password
   */
  @Patch('self/password')
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'This method returns nothing',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
  })
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Body() passwordDto: PasswordDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<void> {
    return this.usersService.changePassword(user.id, passwordDto);
  }

  /**
   * GET /users
   */
  @Get()
  @ApiOperation({ summary: 'Gets all users(not clients)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns users',
    type: UsersDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    description: 'Offset',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Limit',
    required: false,
  })
  @ApiQuery({
    name: 'filter[id]',
    type: Number,
    description: 'User ID',
    required: false,
  })
  @ApiQuery({
    name: 'filter[role]',
    type: Number,
    description: 'Role',
    enum: [Role.CLIENT, Role.MANAGER, Role.ADMIN],
    required: false,
  })
  @ApiQuery({
    name: 'filter[email]',
    description: 'User email',
    required: false,
  })
  @ApiQuery({
    name: 'filter[firstName]',
    description: 'User First Name',
    required: false,
  })
  @ApiQuery({
    name: 'filter[lastName]',
    description: 'User Last Name',
    required: false,
  })
  @ApiQuery({
    name: 'order[id]',
    description: 'Order by ID',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[firstName]',
    description: 'Order by First Name',
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'order[lastName]',
    description: 'Order by Last Name',
    enum: ['asc', 'desc'],
    required: false,
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(SequelizeQueryPipe)
  @UsePipes(TransformPipe)
  @UseInterceptors(BaseResponseSerializerInterceptor)
  async findAll(
    @Query() query: UsersQuery,
    @CurrentUser() user: Partial<User>,
  ): Promise<BaseResponse<User>> {
    const { count, rows } = await this.usersService.findUsers(query, user);
    return {
      count,
      rows: rows.map((row) => new UserDto(row)),
    };
  }

  /**
   * GET /users/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID(not client)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns user',
    type: OmitType(UserDto, ['address', 'bankDetails']),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not Found Error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Partial<User>,
  ): Promise<User> {
    const foundUser = await this.usersService.findUser(id, user);
    return new UserDto(foundUser);
  }

  /**
   * POST /users
   */
  @Post()
  @ApiOperation({ summary: 'Creates user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created user',
    type: OmitType(UserDto, ['address', 'bankDetails']),
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationErrorPipe)
  create(
    @Body() userDto: CreateUserDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.usersService.create(userDto, user);
  }

  /**
   * PATCH /users/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Updates user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ID of updated user',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() userDto: UpdateUserDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.usersService.updateUser(id, userDto, user);
  }
}
