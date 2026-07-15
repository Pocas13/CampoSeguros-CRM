import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { PoliciesModule } from './policies/policies.module';
import { ClaimsModule } from './claims/claims.module';

@Module({
  imports: [ClientsModule, PoliciesModule, ClaimsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
