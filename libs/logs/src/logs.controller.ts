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
  ApiTags,
} from '@nestjs/swagger';

import {
  Roles,
  Role,
  RolesGuard,
  ErrorsInterceptor,
  BaseResponse,
} from '@deliveryapp/common';

import { LogDto } from './dto/log.dto';
import { Log } from './interfaces/log.interface';
import { LogsService } from './logs.service';
import { LogsQuery } from './queries/log.query';

@ApiTags('logs')
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
  @ApiOperation({ summary: 'Get action logs' })
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
