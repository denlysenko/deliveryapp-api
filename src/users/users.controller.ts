import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiImplicitParam, ApiImplicitQuery, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Roles } from 'common/decorators/roles.decorator';
import { Self } from 'common/decorators/self.decorator';
import { Role } from 'common/enums/roles.enum';
import { RolesGuard } from 'common/guards/roles.guard';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { BaseResponse } from 'common/interfaces/base-response.interface';
import { ValidationError } from 'common/models/ValidationError.model';

import { PasswordDto } from './dto/password.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities';
import { UserResponse } from './responses/user.response';
import { UsersResponse } from './responses/users.response';
import { UsersService } from './users.service';

@ApiUseTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService, // private readonly paymentsService: PaymentsService,
  ) // private readonly loggerService: LoggerService,
  // private readonly orderService: OrderService,
  // private readonly messagesService: MessagesService
  {}

  /**
   * GET /users/self
   */
  @ApiOperation({ title: 'Get authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns authenticated user',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @Get('self')
  async getUserSelf(@Self() user: User): Promise<User> {
    const { id } = user;
    return await this.usersService.findById(id);
  }

  /**
   * PATCH /users/self
   */
  @ApiOperation({ title: 'Update authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns updated user',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @Patch('self')
  @HttpCode(HttpStatus.OK)
  async updateUserSelf(
    @Self() user: User,
    @Body() userDto: UserDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.update(user.id, userDto);

    // await this.loggerService.create(
    //   new LogDto({
    //     action: LogActions.UPDATE_PROFILE,
    //     userId: user.id,
    //     createdAt: new Date()
    //   })
    // );

    return updatedUser;
  }

  /**
   * PATCH /users/self/password
   */
  @ApiOperation({ title: 'Change password for authenticated user' })
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
    type: ValidationError,
  })
  @Patch('self/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Self() user: User,
    @Body() passwordDto: PasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(user.id, passwordDto);

    // await this.loggerService.create(
    //   new LogDto({
    //     action: LogActions.CHANGE_PASSWORD,
    //     userId: user.id,
    //     createdAt: new Date()
    //   })
    // );
  }

  /**
   * GET /users
   */
  @ApiOperation({ title: 'Gets all users' })
  @ApiImplicitQuery({
    name: 'offset',
    description: 'Offset',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'limit',
    description: 'Limit',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'filter[id]',
    description: 'User ID',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'filter[role]',
    description: 'Role MANAGER = 2, ADMIN = 3',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'filter[email]',
    description: 'User email',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'filter[firstName]',
    description: 'User First Name',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'filter[lastName]',
    description: 'User Last Name',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'order[id]',
    description: 'Order by ID',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'order[firstName]',
    description: 'Order by First Name',
    required: false,
  })
  @ApiImplicitQuery({
    name: 'order[lastName]',
    description: 'Order by Last Name',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns users',
    type: UsersResponse,
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
  @Roles(Role.MANAGER, Role.ADMIN)
  @Get()
  async findAll(@Query() query: any): Promise<BaseResponse<User>> {
    return await this.usersService.findAll(query);
  }

  /**
   * GET /users/:id
   */
  @ApiOperation({ title: 'Get user by ID' })
  @ApiImplicitParam({
    name: 'id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns user',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findById(@Param('id') id: number): Promise<User> {
    return await this.usersService.findById(id);
  }

  /**
   * POST /users
   */
  @ApiOperation({ title: 'Creates user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created user',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Self() user: User, @Body() userDto: UserDto): Promise<User> {
    const createdUser = await this.usersService.create(userDto);
    delete createdUser.dataValues.password;
    delete createdUser.dataValues.hashedPassword;
    delete createdUser.dataValues.salt;

    // await this.loggerService.create(
    //   new LogDto({
    //     action: LogActions.CREATE_USER,
    //     userId: user.id,
    //     createdAt: new Date(),
    //     data: {
    //       id: createdUser.id
    //     }
    //   })
    // );

    return createdUser;
  }

  /**
   * PATCH /users/:id
   */
  @ApiOperation({ title: 'Updates user' })
  @ApiImplicitParam({
    name: 'id',
    description: 'User ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns updated user',
    type: UserDto,
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
    type: ValidationError,
  })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Self() user: User,
    @Param('id') id: number,
    @Body() userDto: UserDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.update(id, userDto);

    // await this.loggerService.create(
    //   new LogDto({
    //     action: LogActions.UPDATE_USER,
    //     userId: user.id,
    //     createdAt: new Date(),
    //     data: {
    //       id: updatedUser.id
    //     }
    //   })
    // );

    return updatedUser;
  }
}
