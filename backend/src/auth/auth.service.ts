import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const passwordHash = await this.hashPassword(registerDto.password);
    return this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: passwordHash,
    });
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET', this.configService.get('JWT_SECRET', 'change-this-secret')),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    const refreshTokenExpiration = new Date(Date.now() + this.parseDuration(this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d')));
    await this.usersService.setRefreshToken(user.id, refreshToken, refreshTokenExpiration);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.usersService.getRefreshToken(refreshToken);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    const user = await this.usersService.findById(tokenRecord.userId);
    if (!user) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    return this.login(user);
  }

  private parseDuration(duration: string) {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 0;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return value * multipliers[unit as keyof typeof multipliers];
  }
}
