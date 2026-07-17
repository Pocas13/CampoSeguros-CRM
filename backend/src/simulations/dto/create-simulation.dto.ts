export class CreateSimulationDto {
  clientId: number;

  insuranceType: string;

  companyId: number;

  premium?: number;

  commission?: number;

  notes?: string;
}