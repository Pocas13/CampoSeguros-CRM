import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserRole } from "@prisma/client";
import type { Request, Response } from "express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import type { AuthenticatedUser } from "../common/interfaces/authenticated-user.interface";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AcceptInvitationDto } from "./dto/accept-invitation.dto";

const ACCESS_COOKIE = "insureflow_access_token";
const REFRESH_COOKIE = "insureflow_refresh_token";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(
      await this.authService.validateUser(dto.email, dto.password),
    );

    this.writeSessionCookies(response, session.accessToken, session.refreshToken);

    return {
      user: session.user,
      expiresIn: session.expiresIn,
    };
  }

  @Public()
  @Post("refresh")
  async refresh(
    @Req() request: Request,
    @Body() dto: RefreshTokenDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      dto?.refreshToken || this.readCookie(request.headers.cookie, REFRESH_COOKIE);

    if (!refreshToken) {
      throw new UnauthorizedException("Sessão expirada.");
    }

    const session = await this.authService.refreshToken(refreshToken);
    this.writeSessionCookies(response, session.accessToken, session.refreshToken);

    return {
      user: session.user,
      expiresIn: session.expiresIn,
    };
  }

  @Public()
  @Post("accept-invitation")
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(dto);
  }

  @Public()
  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    const secure = this.configService.get<string>("NODE_ENV") === "production";
    const common = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
    };

    response.clearCookie(ACCESS_COOKIE, common);
    response.clearCookie(REFRESH_COOKIE, common);

    return { message: "Sessão terminada com sucesso." };
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Post("register")
  async register(
    @CurrentUser() current: AuthenticatedUser,
    @Body() dto: RegisterDto,
  ) {
    const user = await this.authService.register(
      dto,
      current.companyId ?? undefined,
    );

    return { id: user.id, email: user.email, name: user.name };
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }

  @Patch("profile")
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Patch("password")
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  private writeSessionCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const secure = this.configService.get<string>("NODE_ENV") === "production";
    const accessDuration = this.durationToMilliseconds(
      this.configService.get<string>("JWT_EXPIRES_IN") || "8h",
      8 * 60 * 60 * 1000,
    );
    const refreshDuration = this.durationToMilliseconds(
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d",
      7 * 24 * 60 * 60 * 1000,
    );

    const common = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure,
      path: "/",
    };

    response.cookie(ACCESS_COOKIE, accessToken, {
      ...common,
      maxAge: accessDuration,
    });
    response.cookie(REFRESH_COOKIE, refreshToken, {
      ...common,
      maxAge: refreshDuration,
    });
  }

  private readCookie(header: string | undefined, name: string) {
    if (!header) return null;

    for (const part of header.split(";")) {
      const [key, ...valueParts] = part.trim().split("=");
      if (key === name) {
        return decodeURIComponent(valueParts.join("="));
      }
    }

    return null;
  }

  private durationToMilliseconds(value: string, fallback: number) {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return fallback;

    const amount = Number(match[1]);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * (multipliers[match[2]] || 1);
  }
}
