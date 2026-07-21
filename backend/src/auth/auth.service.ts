import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import { effectivePermissions } from "../common/constants/permissions";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "../users/users.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  avatarUrl: true,
  phone: true,
  jobTitle: true,
  lastLoginAt: true,
  companyId: true,
  permissions: true,
  company: { select: { id: true, name: true, logoUrl: true, status: true, plan: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException("Email ou palavra-passe incorretos.");
    }

    const user = await this.usersService.findByEmail(email);
    if (!user?.active || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Email ou palavra-passe incorretos.");
    }
    if (user.companyId) {
      const organization = await this.prisma.company.findUnique({ where: { id: user.companyId }, select: { status: true } });
      if (!organization || ["SUSPENDED", "CANCELLED"].includes(organization.status)) {
        throw new UnauthorizedException("A organização está suspensa ou inativa.");
      }
    }
    return user;
  }

  async register(registerDto: RegisterDto, companyId?: number) {
    return this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: await this.hashPassword(registerDto.password),
      companyId,
    });
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      name: user.name,
      permissions: effectivePermissions(user.role, (user as User & { permissions?: string[] }).permissions || []),
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get("JWT_REFRESH_SECRET", this.configService.get("JWT_SECRET", "change-this-secret")),
        expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "7d"),
      },
    );
    await this.usersService.updateLastLogin(user.id);
    await this.usersService.setRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + this.parseDuration(this.configService.get("JWT_REFRESH_EXPIRES_IN", "7d"))),
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get("JWT_EXPIRES_IN", "8h"),
      user: await this.me(user.id),
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenRecord = await this.usersService.getRefreshToken(refreshToken);
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("Sessão expirada.");
    }
    const user = await this.usersService.findById(tokenRecord.userId);
    if (!user?.active) throw new UnauthorizedException("Sessão inválida.");
    return this.login(user);
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: safeUserSelect });
    if (!user) throw new UnauthorizedException("Utilizador não encontrado.");
    return { ...user, permissions: effectivePermissions(user.role, user.permissions) };
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.prisma.userInvitation.findUnique({ where: { token: dto.token } });
    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      throw new BadRequestException("O convite é inválido ou expirou.");
    }
    const existing = await this.prisma.user.findUnique({ where: { email: invitation.email } });
    if (existing) throw new BadRequestException("Já existe um utilizador com este email.");
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          companyId: invitation.companyId,
          email: invitation.email,
          name: dto.name.trim(),
          password: await bcrypt.hash(dto.password, 10),
          role: invitation.role,
          permissions: invitation.permissions,
          phone: dto.phone?.trim() || null,
          jobTitle: dto.jobTitle?.trim() || null,
        },
      });
      await tx.userInvitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
      return created;
    });
    return { message: "Acesso criado com sucesso.", email: user.email };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name?.trim(),
        phone: dto.phone === undefined ? undefined : dto.phone?.trim() || null,
        jobTitle: dto.jobTitle === undefined ? undefined : dto.jobTitle?.trim() || null,
        avatarUrl: dto.avatarUrl === undefined ? undefined : dto.avatarUrl?.trim() || null,
      },
      select: safeUserSelect,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new BadRequestException("A palavra-passe atual está incorreta.");
    }
    await this.prisma.user.update({ where: { id: userId }, data: { password: await this.hashPassword(dto.newPassword) } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: "Palavra-passe alterada com sucesso. Inicie sessão novamente." };
  }

  private parseDuration(duration: string) {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 86_400_000;
    const value = Number(match[1]);
    const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return value * multipliers[match[2] as keyof typeof multipliers];
  }
}
