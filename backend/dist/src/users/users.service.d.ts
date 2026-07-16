import { PrismaService } from '../prisma/prisma.service';
import { User, RefreshToken } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(data: {
        email: string;
        name?: string;
        password: string;
    }): Promise<User>;
    setRefreshToken(userId: number, refreshToken: string, expiresAt: Date): Promise<RefreshToken>;
    getRefreshToken(token: string): Promise<RefreshToken | null>;
    clearRefreshToken(token: string): import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
}
