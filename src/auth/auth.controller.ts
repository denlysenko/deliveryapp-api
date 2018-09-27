import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiImplicitBody, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { ValidationError } from 'common/models/ValidationError.model';
import { UserDto } from 'users/dto/user.dto';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthPayload } from './interfaces/auth-payload.interface';
import { AuthError, AuthResponse } from './responses/auth.response';

@ApiUseTags('auth')
@Controller('auth')
// @UseInterceptors(ExceptionInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService, // private readonly loggerService: LoggerService,
  ) {}

  // POST `/auth/local`
  @ApiOperation({ title: 'Authentication' })
  @ApiImplicitBody({
    name: 'credentials',
    description: 'Email and Password',
    required: true,
    type: AuthDto,
  })
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
  @Post('local')
  async authenticate(@Body() authDto: AuthDto): Promise<AuthPayload> {
    const { email, password } = authDto;
    return await this.authService.login(email, password);
  }

  // POST `/auth/register`
  @ApiOperation({ title: 'Registration' })
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
  @Post('register')
  async register(@Body() userDto: UserDto): Promise<AuthPayload> {
    // await this.loggerService.create(
    //   new LogDto({
    //     action: LogActions.REGISTRATION,
    //     userId: user.id,
    //     createdAt: new Date(),
    //   }),
    // );

    return await this.authService.signup(userDto);
  }
}
