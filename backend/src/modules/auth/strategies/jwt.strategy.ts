// src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../../prisma/prisma.service.js';

import { UserStatus } from '../../../generated/prisma/client.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    status: string;
    companyId?: string;
  }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido.');
    }

    if (!payload.companyId) {
      throw new UnauthorizedException('Tenant não informado no token.');
    }

    const user = await this.prisma.users.findFirst({
      where: {
        id: BigInt(payload.sub),
        company_id: BigInt(payload.companyId),
        active: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuário inativo ou suspenso.');
    }

    return {
      sub: user.id.toString(),
      companyId: user.company_id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
