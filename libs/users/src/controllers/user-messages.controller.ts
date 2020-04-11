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
  Self,
  Role,
  ErrorsInterceptor,
  BaseResponse,
} from '@deliveryapp/common';
import {
  Message,
  MessagesService,
  MessagesResponse,
} from '@deliveryapp/messages';

import { User } from '../entities/User';
import { MessagesQuery } from '../queries/messages.query';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users/self/messages')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class UserMessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /users/self/messages
   */
  @Get()
  @ApiOperation({ summary: 'Gets all messages for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns messages',
    type: MessagesResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  async getMessagesSelf(
    @Self() user: User,
    @Query() query: MessagesQuery,
  ): Promise<BaseResponse<Message>> {
    return user.role === Role.CLIENT
      ? await this.messagesService.getByUserId(user.id, query)
      : await this.messagesService.getForEmployees(query);
  }
}
