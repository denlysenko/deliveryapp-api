import { Roles, Self } from '@common/decorators';
import { LogActions, Role } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { ErrorsInterceptor } from '@common/interceptors';
import { BaseResponse } from '@common/interfaces';
import { ValidationError } from '@common/models';

import { LogDto } from '@logs/dto';
import { LogsService } from '@logs/logs.service';

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
import {
  ApiBearerAuth,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User';
import { UsersQuery } from '../queries/users.query';
import { UserResponse } from '../responses/user.response';
import { UsersResponse } from '../responses/users.response';
import { UsersService } from '../users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * GET /users
   */
  @Get()
  @ApiOperation({ summary: 'Gets all users' })
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
  async findAll(@Query() query: UsersQuery): Promise<BaseResponse<User>> {
    return await this.usersService.findAll(query);
  }

  /**
   * GET /users/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async findById(@Param('id') id: number): Promise<User> {
    return await this.usersService.findById(id);
  }

  /**
   * POST /users
   */
  @Post()
  @ApiOperation({ summary: 'Creates user' })
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async create(@Self() user: User, @Body() userDto: UserDto): Promise<User> {
    const createdUser = await this.usersService.create(userDto);

    delete createdUser.password;
    delete createdUser.hashedPassword;
    delete createdUser.salt;

    await this.logsService.create(
      new LogDto({
        action: LogActions.CREATE_USER,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: createdUser.id,
        },
      }),
    );

    return createdUser;
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(
    @Self() user: User,
    @Param('id') id: number,
    @Body() userDto: UserDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.update(id, userDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.UPDATE_USER,
        userId: user.id,
        createdAt: new Date(),
        data: {
          id: updatedUser.id,
        },
      }),
    );

    return updatedUser;
  }
}
