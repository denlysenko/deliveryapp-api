import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Self,
  LogActions,
  ErrorsInterceptor,
  ValidationError,
} from '@deliveryapp/common';

import { LogDto, LogsService } from '@deliveryapp/logs';

import { PasswordDto } from '../dto/password.dto';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/User';
import { UserResponse } from '../responses/user.response';
import { UsersService } from '../users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/self')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UserSelfController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * GET /users/self
   */
  @Get()
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns authenticated user',
    type: UserResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  async getSelf(@Self() user: User): Promise<User> {
    const { id } = user;
    return await this.usersService.findById(id);
  }

  /**
   * PATCH /users/self
   */
  @Patch()
  @ApiOperation({ summary: 'Update authenticated user' })
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
  @HttpCode(HttpStatus.OK)
  async updateUserSelf(
    @Self() user: User,
    @Body() userDto: UserDto,
  ): Promise<User> {
    const updatedUser = await this.usersService.update(user.id, userDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.UPDATE_PROFILE,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return updatedUser;
  }

  /**
   * PATCH /users/self/password
   */
  @Patch('password')
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
    type: ValidationError,
  })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Self() user: User,
    @Body() passwordDto: PasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(user.id, passwordDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.CHANGE_PASSWORD,
        userId: user.id,
        createdAt: new Date(),
      }),
    );
  }
}
