import { Self } from '@common/decorators';
import { Role } from '@common/enums';
import { ErrorsInterceptor } from '@common/interceptors';

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiImplicitParam,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { User } from '@users/entities';

import { SessionDto } from './dto/session.dto';
import { Message } from './interfaces';
import { MessagesService } from './messages.service';

@ApiUseTags('messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ErrorsInterceptor)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * PATCH /messages/{id}
   */
  @Patch(':id')
  @ApiOperation({ title: 'Marks message as read' })
  @ApiImplicitParam({
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
  async markAsRead(@Param('id') id: string): Promise<Message> {
    return await this.messagesService.markAsRead(id);
  }

  /**
   * POST /messages/subscribe
   */
  @Post('subscribe')
  @ApiOperation({ title: 'Subscribes device to messages' })
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
    @Self() user: User,
  ) {
    const { socketId } = sessionDto;

    try {
      await this.messagesService.createSession({
        socketId,
        userId: user.id,
      });

      if (user.role !== Role.CLIENT) {
        await this.messagesService.subscribeToEmployees(socketId);
      }
    } catch (err) {
      return err;
    }
  }

  /**
   * POST /messages/unsubscribe
   */
  @Post('unsubscribe')
  @ApiOperation({ title: 'Unsubscribes device from messages' })
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
    @Self() user: User,
  ) {
    const { socketId } = sessionDto;

    try {
      await this.messagesService.removeSession(socketId);

      if (user.role !== Role.CLIENT) {
        await this.messagesService.unsubscribeFromEmployees(socketId);
      }
    } catch (err) {
      return err;
    }
  }
}
