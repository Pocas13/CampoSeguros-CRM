import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, RefreshToken } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

 create(data: { email: string; name: string; password: string }): Promise<User> {
  return this.prisma.user.create({
    data,
  });
}

  setRefreshToken(userId: number, refreshToken: string, expiresAt: Date): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  }

  getRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: {
        token,
      },
    });
  }

  clearRefreshToken(token: string) {
    return this.prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }
}
