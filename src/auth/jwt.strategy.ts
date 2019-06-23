import { AuthErrors } from '@common/enums';

import { ConfigService } from '@config/config.service';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from './auth.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload, done: any) {
    const user = await this.authService.validate(payload);
    if (!user) {
      return done(
        new UnauthorizedException(AuthErrors.UNAUTHORIZED_ERR),
        false,
      );
    }

    done(null, user);
  }
}
