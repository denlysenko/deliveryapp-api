import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '@deliveryapp/common';
import {
  BaseResponse,
  ErrorsInterceptor,
  ICurrentUser,
  JwtAuthGuard,
  Message,
  MessagesDto,
  SessionDto,
  TransformPipe,
} from '@deliveryapp/core';

import { MessagesQuery } from './messages.query';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ErrorsInterceptor)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /messages
   */
  @Get()
  @ApiOperation({ summary: 'Gets all messages for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns messages',
    type: MessagesDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    description: 'Offset',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Limit',
    required: false,
  })
  @UsePipes(TransformPipe)
  getMessages(
    @Query() query: MessagesQuery,
    @CurrentUser() user: ICurrentUser,
  ): Promise<BaseResponse<Message>> {
    return this.messagesService.getMessages(query, user);
  }

  /**
   * PATCH /messages/{id}
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Marks message as read' })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string): Promise<void> {
    return this.messagesService.markAsRead(id);
  }

  /**
   * POST /messages/subscribe
   */
  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribes device to messages' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @HttpCode(HttpStatus.OK)
  async subscribeToMessages(
    @Body() sessionDto: SessionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.messagesService.subscribe(sessionDto, user);
  }

  /**
   * POST /messages/unsubscribe
   */
  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribes device from messages' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  @HttpCode(HttpStatus.OK)
  async unsubscribeFromMessages(
    @Body() sessionDto: SessionDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    const { socketId } = sessionDto;
    return this.messagesService.unsubscribe(socketId, user);
  }
}
