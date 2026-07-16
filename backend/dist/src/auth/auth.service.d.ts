import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    hashPassword(password: string): Promise<any>;
    validateUser(email: string, password: string): Promise<{
        name: string | null;
        id: number;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    register(registerDto: RegisterDto): Promise<{
        name: string | null;
        id: number;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: any;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: any;
    }>;
    private parseDuration;
}
