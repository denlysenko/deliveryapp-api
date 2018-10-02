import { Controller, Get, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { Self } from 'common/decorators/self.decorator';
import { Role } from 'common/enums/roles.enum';
import { ErrorsInterceptor } from 'common/interceptors/errors.interceptor';
import { MessageDto } from 'messages/dto/message.dto';
import { Message } from 'messages/interfaces/message.interface';
import { MessagesService } from 'messages/messages.service';

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
  async getMessagesSelf(@Self() user: User): Promise<Message[]> {
    return user.role === Role.CLIENT
      ? await this.messagesService.getByUserId(user.id)
      : await this.messagesService.getForEmployees();
  }
}
