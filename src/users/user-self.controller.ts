import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Self } from 'common/decorators/self.decorator';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { ValidationError } from 'common/models/ValidationError.model';

import { PasswordDto } from './dto/password.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities';
import { UserResponse } from './responses/user.response';
import { UsersService } from './users.service';

@ApiUseTags('users')
@ApiBearerAuth()
@Controller('users/self')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UserSelfController {
  constructor(
    private readonly usersService: UsersService, // private readonly loggerService: LoggerService,
  ) {}

  /**
   * GET /users/self
   */
  @Get()
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
  async getUserSelf(@Self() user: User): Promise<User> {
    const { id } = user;
    return await this.usersService.findById(id);
  }

  /**
   * PATCH /users/self
   */
  @Patch()
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
  @Patch('password')
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
}
