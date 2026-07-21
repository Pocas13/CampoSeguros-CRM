import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClientsModule } from "./clients/clients.module";
import { PoliciesModule } from "./policies/policies.module";
import { ClaimsModule } from "./claims/claims.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CompaniesModule } from "./companies/companies.module";
import { RolesModule } from "./roles/roles.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SimulationsModule } from "./simulations/simulations.module";
import { InsurersModule } from "./insurers/insurers.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { QuotesModule } from "./quotes/quotes.module";
import { CalendarModule } from "./calendar/calendar.module";
import { VehicleLookupModule } from "./vehicle-lookup/vehicle-lookup.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { AuditModule } from "./audit/audit.module";
import { PlatformModule } from "./platform/platform.module";
import { SearchModule } from "./search/search.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule,
    PoliciesModule,
    ClaimsModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    RolesModule,
    SimulationsModule,
    InsurersModule,
    DashboardModule,
    QuotesModule,
    CalendarModule,
    VehicleLookupModule,
    IntegrationsModule,
    AuditModule,
    PlatformModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
