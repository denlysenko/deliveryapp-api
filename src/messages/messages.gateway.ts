import { UnauthorizedException } from '@nestjs/common';
import { OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { AuthService } from 'auth/auth.service';
import { JwtPayload } from 'auth/interfaces/jwt-payload.interface';
import { Role } from 'common/enums/roles.enum';
import { ConfigService } from 'config/config.service';
import * as jwt from 'jsonwebtoken';
import { User } from 'users/entities/User';

import { SessionDto } from './dto/session.dto';
import { MessagesService } from './messages.service';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const MESSAGE = 'MESSAGE';
export const MARK_AS_READ = 'MARK_AS_READ';
export const MARK_AS_READ_SUCCESS = 'MARK_AS_READ_SUCCESS';
export const EMPLOYEES_ROOM = 'employees';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayDisconnect, OnGatewayInit {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: SocketIO.Server) {
    this.messagesService.setIOServer(server);
  }

  async handleDisconnect(socket) {
    await this.messagesService.removeSession(socket.id);
  }

  @SubscribeMessage(LOGIN)
  async onLogin(client, { token }) {
    const user = await this.validateToken(token);

    if (user.role === Role.CLIENT) {
      const sessionDto = new SessionDto({
        socketId: client.id,
        userId: user.id,
      });

      await this.messagesService.createSession(sessionDto);
    } else {
      client.join(EMPLOYEES_ROOM);
    }
  }

  @SubscribeMessage(LOGOUT)
  async onLogout(client, { token }) {
    const user = await this.validateToken(token);

    if (user.role === Role.CLIENT) {
      await this.messagesService.removeSession(client.id);
    } else {
      client.leave(EMPLOYEES_ROOM);
    }
  }

  @SubscribeMessage(MARK_AS_READ)
  async onMarkAsRead(client, data) {
    await this.messagesService.markAsRead(data.id, client.id);
  }

  private async validateToken(token: string): Promise<User> {
    let jwtPayload: JwtPayload;

    try {
      jwtPayload = jwt.verify(token, this.configService.get('JWT_SECRET'));
    } catch (err) {
      throw new UnauthorizedException('CREDENTIALS_BAD_FORMAT');
    }

    const user = await this.authService.validate(jwtPayload);

    if (!user) {
      throw new UnauthorizedException('UNAUTHORIZED_ERR');
    }

    return user;
  }
}
