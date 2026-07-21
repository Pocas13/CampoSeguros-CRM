import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InviteUserDto } from "./dto/invite-user.dto";

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
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findSafeById(id: number) {
    return this.prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  }



  directory(companyId: number) {
    return this.prisma.user.findMany({
      where: { companyId, active: true },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        jobTitle: true,
      },
      orderBy: { name: "asc" },
    });
  }

  list(companyId: number) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: safeUserSelect,
      orderBy: [{ active: "desc" }, { name: "asc" }],
    });
  }

  async createForCompany(companyId: number, data: CreateUserDto) {
    if (data.role === UserRole.SUPER_ADMIN) throw new ForbiddenException("Apenas a plataforma pode criar super administradores.");
    const [organization, users] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: companyId }, select: { maxUsers: true } }),
      this.prisma.user.count({ where: { companyId, active: true } }),
    ]);
    if (!organization) throw new NotFoundException("Organização não encontrada.");
    if (users >= organization.maxUsers) throw new ConflictException("Foi atingido o limite de utilizadores ativos do plano.");
    try {
      return await this.prisma.user.create({
        data: {
          companyId,
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password: await bcrypt.hash(data.password, 10),
          role: data.role ?? UserRole.EMPLOYEE,
          permissions: data.permissions ?? [],
          phone: data.phone?.trim() || null,
          jobTitle: data.jobTitle?.trim() || null,
          avatarUrl: data.avatarUrl?.trim() || null,
        },
        select: safeUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Já existe um utilizador com este email.");
      }
      throw error;
    }
  }

  async updateForCompany(companyId: number, id: number, data: UpdateUserDto) {
    const existing = await this.prisma.user.findFirst({ where: { id, companyId } });
    if (data.role === UserRole.SUPER_ADMIN) throw new ForbiddenException("Apenas a plataforma pode atribuir este nível.");
    if (!existing) throw new NotFoundException("Utilizador não encontrado.");

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name?.trim(),
          email: data.email?.toLowerCase().trim(),
          password: data.password ? await bcrypt.hash(data.password, 10) : undefined,
          role: data.role,
          permissions: data.permissions,
          active: data.active,
          phone: data.phone === undefined ? undefined : data.phone?.trim() || null,
          jobTitle: data.jobTitle === undefined ? undefined : data.jobTitle?.trim() || null,
          avatarUrl: data.avatarUrl === undefined ? undefined : data.avatarUrl?.trim() || null,
        },
        select: safeUserSelect,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("Já existe um utilizador com este email.");
      }
      throw error;
    }
  }

  async createInvitation(companyId: number, invitedById: number, data: InviteUserDto) {
    if (data.role === UserRole.SUPER_ADMIN) throw new ForbiddenException("Não é possível convidar um super administrador.");
    const email = data.email.toLowerCase().trim();
    const [exists, organization, activeUsers, pendingInvitations] = await Promise.all([
      this.prisma.user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.company.findUnique({ where: { id: companyId }, select: { maxUsers: true } }),
      this.prisma.user.count({ where: { companyId, active: true } }),
      this.prisma.userInvitation.count({ where: { companyId, acceptedAt: null, expiresAt: { gt: new Date() } } }),
    ]);
    if (exists) throw new ConflictException("Já existe um utilizador com este email.");
    if (!organization) throw new NotFoundException("Organização não encontrada.");
    if (activeUsers + pendingInvitations >= organization.maxUsers) {
      throw new ConflictException("Foi atingido o limite de utilizadores e convites do plano.");
    }
    await this.prisma.userInvitation.deleteMany({ where: { companyId, email, acceptedAt: null } });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await this.prisma.userInvitation.create({
      data: { companyId, invitedById, email, role: data.role || UserRole.EMPLOYEE, permissions: data.permissions || [], token, expiresAt },
    });
    return { ...invitation, invitationUrl: `/accept-invitation?token=${token}` };
  }

  listInvitations(companyId: number) {
    return this.prisma.userInvitation.findMany({
      where: { companyId, acceptedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, email: true, role: true, permissions: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async cancelInvitation(companyId: number, id: number) {
    const invitation = await this.prisma.userInvitation.findFirst({ where: { id, companyId } });
    if (!invitation) throw new NotFoundException("Convite não encontrado.");
    return this.prisma.userInvitation.delete({ where: { id } });
  }

  async deactivate(companyId: number, id: number, currentUserId: number) {
    if (id === currentUserId) throw new ConflictException("Não pode desativar o seu próprio acesso.");
    return this.updateForCompany(companyId, id, { active: false });
  }

  create(data: { email: string; name: string; password: string; companyId?: number; role?: UserRole }) {
    return this.prisma.user.create({ data: { ...data, email: data.email.toLowerCase().trim() } });
  }

  updateLastLogin(id: number) {
    return this.prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  setRefreshToken(userId: number, refreshToken: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({ data: { userId, token: refreshToken, expiresAt } });
  }

  getRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  clearRefreshToken(token: string) {
    return this.prisma.refreshToken.deleteMany({ where: { token } });
  }
}
