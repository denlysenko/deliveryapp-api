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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser, Role, Roles } from '@deliveryapp/common';
import {
  Address,
  AddressDto,
  BankDetails,
  BankDetailsDto,
  ErrorsInterceptor,
  JwtAuthGuard,
  RolesGuard,
  User,
} from '@deliveryapp/core';

import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /settings/address
   */
  @Get('address')
  @ApiOperation({ summary: 'Get company address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns company`s address',
    type: AddressDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  async getAddress(): Promise<Address> {
    const address = await this.settingsService.getAddress();
    return new AddressDto(address);
  }

  /**
   * POST /settings/address
   */
  @Post('address')
  @ApiOperation({ summary: 'Create company address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created ID of company`s address',
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  createAddress(
    @Body() addressDto: AddressDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.settingsService.createAddress(addressDto, user);
  }

  /**
   * PATCH /settings/address/:id
   */
  @Patch('address/:id')
  @ApiOperation({ summary: 'Update company address' })
  @ApiParam({
    name: 'id',
    description: 'Company Address ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ID of updated company`s address',
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() addressDto: AddressDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.settingsService.updateAddress(id, addressDto, user);
  }

  /**
   * GET /settings/bank-details
   */
  @Get('bank-details')
  @ApiOperation({ summary: 'Get company`s bank details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns company`s bank details',
    type: BankDetailsDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden Error',
  })
  @Roles(Role.ADMIN)
  @UseInterceptors(ClassSerializerInterceptor)
  async getBankDetails(): Promise<BankDetails> {
    const bankDetails = await this.settingsService.getBankDetails();
    return new BankDetailsDto(bankDetails);
  }

  /**
   * POST /settings/bank-details
   */
  @Post('bank-details')
  @ApiOperation({ summary: 'Create company bank details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ID of created company`s bank details',
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  createBankDetails(
    @Body() bankDetailsDto: BankDetailsDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.settingsService.createBankDetails(bankDetailsDto, user);
  }

  /**
   * PATCH /settings/bank-details/:id
   */
  @Patch('bank-details/:id')
  @ApiOperation({ summary: 'Update company bank details' })
  @ApiParam({
    name: 'id',
    description: 'Company Bank Details ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns ID of updated company`s bank details',
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  updateBankDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body() bankDetailsDto: BankDetailsDto,
    @CurrentUser() user: Partial<User>,
  ): Promise<{ id: number }> {
    return this.settingsService.updateBankDetails(id, bankDetailsDto, user);
  }
}
