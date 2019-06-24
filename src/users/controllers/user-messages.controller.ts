import { Self } from '@common/decorators';
import { Role } from '@common/enums';
import { ErrorsInterceptor } from '@common/interceptors';

import { MessageDto } from '@messages/dto';
import { Message } from '@messages/interfaces';
import { MessagesService } from '@messages/messages.service';

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

import { User } from '../entities/User';

@ApiUseTags('users')
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
  @ApiOperation({ title: 'Gets all messages for authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns messages',
    type: MessageDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization Error',
  })
  async getMessagesSelf(
    @Self() user: User,
    @Query() query: { offset: number; limit: number },
  ): Promise<Message[]> {
    return user.role === Role.CLIENT
      ? await this.messagesService.getByUserId(user.id, query)
      : await this.messagesService.getForEmployees(query);
  }
}
