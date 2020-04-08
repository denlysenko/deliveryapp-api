import { LogActions } from '@common/enums';
import { ErrorsInterceptor } from '@common/interceptors';
import { ValidationError } from '@common/models';

import { LogDto } from '@logs/dto';
import { LogsService } from '@logs/logs.service';

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserDto } from '@users/dto';
import { UsersService } from '@users/users.service';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthPayload } from './interfaces/auth-payload.interface';
import { AuthError, AuthResponse } from './responses/auth.response';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ErrorsInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly logsService: LogsService,
  ) {}

  // POST `/auth/login`
  @Post('login')
  @ApiOperation({ summary: 'Authentication' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns JWT token',
    type: AuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
    type: AuthError,
  })
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() authDto: AuthDto): Promise<AuthPayload> {
    const { email, password } = authDto;
    return await this.authService.login(email, password);
  }

  // POST `/auth/register`
  @Post('register')
  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns JWT token',
    type: AuthResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @HttpCode(HttpStatus.OK)
  async register(@Body() userDto: UserDto): Promise<AuthPayload> {
    const user = await this.usersService.create(userDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.REGISTRATION,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return { token: this.authService.createToken(user.id) };
  }
}
