import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@deliveryapp/common';
import {
  AuthPayload,
  AuthPayloadDto,
  ErrorsInterceptor,
  JwtAuthGuard,
  LoginDto,
  LoginErrorDto,
  RegisterUserDto,
  User,
  ValidationError,
  ValidationErrorPipe,
} from '@deliveryapp/core';

import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
@UsePipes(ValidationErrorPipe)
@UseInterceptors(ErrorsInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST `/auth/login`
   */
  @Post('login')
  @ApiOperation({ summary: 'Authentication' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns JWT token',
    type: AuthPayloadDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Authorization Error',
    type: LoginErrorDto,
  })
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  authenticate(@Body() loginDto: LoginDto): Promise<AuthPayload> {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }

  /**
   * POST `/auth/register`
   */
  @Post('register')
  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns JWT token',
    type: AuthPayloadDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @UsePipes(ValidationErrorPipe)
  @HttpCode(HttpStatus.OK)
  register(@Body() createUserDto: RegisterUserDto): Promise<AuthPayload> {
    return this.authService.register(createUserDto);
  }

  /**
   * POST `/auth/refreshToken`
   */
  @Post('refreshToken')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns JWT token',
    type: AuthPayloadDto,
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'Validation Error',
    type: ValidationError,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  refreshToken(@CurrentUser() user: User): AuthPayload {
    return { token: this.authService.createToken(user.id!) };
  }
}
