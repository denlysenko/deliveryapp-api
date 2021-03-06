import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Role, Roles } from '@deliveryapp/common';
import {
  BaseResponse,
  Log,
  JwtAuthGuard,
  LogDto,
  RolesGuard,
  TransformPipe,
} from '@deliveryapp/core';

import { LogsQuery } from './logs.query';
import { LogsService } from './logs.service';

@ApiTags('logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * GET /logs
   */
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
  @ApiQuery({
    name: 'filter[action]',
    description: 'Action',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'filter[userId]',
    description: 'User ID',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'order[createdAt]',
    description: 'Creation Date',
    type: String,
    enum: ['asc', 'desc'],
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Limit',
    type: Number,
    required: false,
  })
  @Get()
  @Roles(Role.ADMIN)
  @UsePipes(TransformPipe)
  findLogs(@Query() query: LogsQuery): Promise<BaseResponse<Log>> {
    return this.logsService.findAll(query);
  }
}
