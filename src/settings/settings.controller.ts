import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiImplicitParam, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Roles } from 'common/decorators/roles.decorator';
import { Self } from 'common/decorators/self.decorator';
import { LogActions } from 'common/enums/logs.enum';
import { Role } from 'common/enums/roles.enum';
import { RolesGuard } from 'common/guards/roles.guard';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { ValidationError } from 'common/models/ValidationError.model';
import { LogDto } from 'logs/dto/log.dto';
import { LogsService } from 'logs/logs.service';
import { User } from 'users/entities';

import { CompanyAddressDto } from './dto/company-address.dto';
import { CompanyBankDetailsDto } from './dto/company-bank-details.dto';
import { CompanyAddress, CompanyBankDetails } from './entities';
import { SettingsService } from './settings.service';

@ApiUseTags('settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly logsService: LogsService,
  ) {}

  /**
   * GET /settings/address
   */
  @Get('address')
  @ApiOperation({ title: 'Get company address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns company`s address',
    type: CompanyAddressDto,
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
  async getAddress(): Promise<CompanyAddress> {
    return await this.settingsService.getAddress();
  }

  /**
   * POST /settings/address
   */
  @Post('address')
  @ApiOperation({ title: 'Create company address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created company`s address',
    type: CompanyAddressDto,
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async createAddress(
    @Self() user: User,
    @Body() addressDto: CompanyAddressDto,
  ): Promise<CompanyAddress> {
    const address = await this.settingsService.createAddress(addressDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.CREATE_COMPANY_ADDRESS,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return address;
  }

  /**
   * PATCH /settings/address/:id
   */
  @Patch('address/:id')
  @ApiOperation({ title: 'Update company address' })
  @ApiImplicitParam({
    name: 'id',
    description: 'Company Address ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns updated company`s address',
    type: CompanyAddressDto,
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Self() user: User,
    @Param('id') id: number,
    @Body() addressDto: CompanyAddressDto,
  ): Promise<CompanyAddress> {
    const address = await this.settingsService.updateAddress(id, addressDto);

    await this.logsService.create(
      new LogDto({
        action: LogActions.UPDATE_COMPANY_ADDRESS,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return address;
  }

  /**
   * GET /settings/bank-details
   */
  @Get('bank-details')
  @ApiOperation({ title: 'Get company`s bank details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns company`s bank details',
    type: CompanyBankDetailsDto,
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
  async getBankDetails(): Promise<CompanyBankDetails> {
    return await this.settingsService.getBankDetails();
  }

  /**
   * POST /settings/bank-details
   */
  @Post('bank-details')
  @ApiOperation({ title: 'Create company bank details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created company`s bank details',
    type: CompanyBankDetailsDto,
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async createBankDetails(
    @Self() user: User,
    @Body() bankDetailsDto: CompanyBankDetailsDto,
  ): Promise<CompanyBankDetails> {
    const bankDetails = await this.settingsService.createBankDetails(
      bankDetailsDto,
    );

    await this.logsService.create(
      new LogDto({
        action: LogActions.CREATE_COMPANY_BANK_DETAILS,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return bankDetails;
  }

  /**
   * PATCH /settings/bank-details/:id
   */
  @Patch('bank-details/:id')
  @ApiOperation({ title: 'Update company bank details' })
  @ApiImplicitParam({
    name: 'id',
    description: 'Company Bank Details ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns updated company`s bank details',
    type: CompanyBankDetailsDto,
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
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateBankDetails(
    @Self() user: User,
    @Param('id') id: number,
    @Body() bankDetailsDto: CompanyBankDetailsDto,
  ): Promise<CompanyBankDetails> {
    const bankDetails = await this.settingsService.updateBankDetails(
      id,
      bankDetailsDto,
    );

    await this.logsService.create(
      new LogDto({
        action: LogActions.UPDATE_COMPANY_BANK_DETAILS,
        userId: user.id,
        createdAt: new Date(),
      }),
    );

    return bankDetails;
  }
}
