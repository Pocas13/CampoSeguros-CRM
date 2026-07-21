import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { EncryptionService } from "./encryption.service";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, EncryptionService],
  exports: [IntegrationsService, EncryptionService],
})
export class IntegrationsModule {}
