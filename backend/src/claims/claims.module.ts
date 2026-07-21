import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ClaimsController } from "./claims.controller";
import { ClaimsService } from "./claims.service";
@Module({ imports: [PrismaModule], controllers: [ClaimsController], providers: [ClaimsService] })
export class ClaimsModule {}
