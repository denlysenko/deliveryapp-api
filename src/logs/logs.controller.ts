import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';

import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/enums/roles.enum';
import { RolesGuard } from 'common/guards/roles.guard';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { BaseResponse } from 'common/interfaces/base-response.interface';

import { LogDto } from './dto/log.dto';
import { Log } from './interfaces/log.interface';
import { LogsService } from './logs.service';
import { LogsQuery } from './queries/log.query';

@ApiUseTags('logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * GET /logs
   */
  @Get()
  @ApiOperation({ title: 'Get action logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns action logs',
    type: LogDto,
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
  async getLogs(@Query() query: LogsQuery): Promise<BaseResponse<Log>> {
    return await this.logsService.get(query);
  }
}
