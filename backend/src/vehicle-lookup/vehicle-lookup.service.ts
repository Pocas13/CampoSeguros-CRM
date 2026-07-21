import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LookupVehicleDto } from "./dto/lookup-vehicle.dto";

export type VehicleCandidate = {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  version?: string | null;
  firstRegistrationDate?: string | null;
  year?: number | null;
  fuelType?: string | null;
  bodyType?: string | null;
  engineCapacityCc?: number | null;
  powerKw?: number | null;
  powerHp?: number | null;
  transmission?: string | null;
  seats?: number | null;
  vin?: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

export type VehicleLookupResult = {
  registrationNumber: string;
  status: "FOUND" | "MULTIPLE" | "NOT_FOUND";
  source: "DEMO" | "CUSTOM_API" | "MANUAL";
  requiresFirstRegistrationDate: boolean;
  candidates: VehicleCandidate[];
  message: string;
};

const demoVehicles: Record<string, VehicleCandidate[]> = {
  "12-AB-34": [
    {
      id: "demo-peugeot-308-sw",
      registrationNumber: "12-AB-34",
      make: "Peugeot",
      model: "308 SW",
      version: "1.5 BlueHDi 130 EAT8",
      firstRegistrationDate: "2021-03-15",
      year: 2021,
      fuelType: "Gasóleo",
      bodyType: "Carrinha",
      engineCapacityCc: 1499,
      powerKw: 96,
      powerHp: 130,
      transmission: "Automática",
      seats: 5,
      confidence: "HIGH",
    },
  ],
  "AA-00-AA": [
    {
      id: "demo-renault-clio-bi-fuel",
      registrationNumber: "AA-00-AA",
      make: "Renault",
      model: "Clio V",
      version: "1.0 TCe Evolution Bi-Fuel 91",
      firstRegistrationDate: "2023-06-01",
      year: 2023,
      fuelType: "Gasolina/GPL",
      bodyType: "Utilitário",
      engineCapacityCc: 999,
      powerKw: 67,
      powerHp: 91,
      transmission: "Manual",
      seats: 5,
      confidence: "HIGH",
    },
  ],
  "34-CD-56": [
    {
      id: "demo-bmw-r1250gs",
      registrationNumber: "34-CD-56",
      make: "BMW",
      model: "R 1250 GS",
      version: "Adventure",
      firstRegistrationDate: "2022-04-10",
      year: 2022,
      fuelType: "Gasolina",
      bodyType: "Moto",
      engineCapacityCc: 1254,
      powerKw: 100,
      powerHp: 136,
      transmission: "Manual",
      seats: 2,
      confidence: "HIGH",
    },
  ],
};

@Injectable()
export class VehicleLookupService {
  constructor(private readonly configService: ConfigService) {}

  async lookup(dto: LookupVehicleDto): Promise<VehicleLookupResult> {
    const registrationNumber = this.normalizeRegistration(dto.registrationNumber);
    const provider = this.configService.get<string>("VEHICLE_LOOKUP_PROVIDER", "demo").toLowerCase();

    if (provider === "custom") {
      return this.lookupCustomApi(registrationNumber, dto);
    }

    const candidates = (demoVehicles[registrationNumber] ?? []).filter((candidate) => {
      if (!dto.firstRegistrationDate || !candidate.firstRegistrationDate) return true;
      return candidate.firstRegistrationDate === dto.firstRegistrationDate;
    });

    if (candidates.length === 1) {
      return {
        registrationNumber,
        status: "FOUND",
        source: "DEMO",
        requiresFirstRegistrationDate: false,
        candidates,
        message: "Veículo de demonstração identificado. Configure um fornecedor profissional para consultar matrículas reais.",
      };
    }

    if (candidates.length > 1) {
      return {
        registrationNumber,
        status: "MULTIPLE",
        source: "DEMO",
        requiresFirstRegistrationDate: !dto.firstRegistrationDate,
        candidates,
        message: "Foram encontradas várias versões. Confirme a data da primeira matrícula e selecione a versão correta.",
      };
    }

    return {
      registrationNumber,
      status: "NOT_FOUND",
      source: "MANUAL",
      requiresFirstRegistrationDate: false,
      candidates: [],
      message: "A matrícula não foi encontrada no fornecedor configurado. Preencha os dados manualmente ou configure uma API de dados automóveis.",
    };
  }

  status() {
    const provider = this.configService.get<string>("VEHICLE_LOOKUP_PROVIDER", "demo").toLowerCase();
    return {
      provider,
      configured: provider === "custom" && Boolean(this.configService.get<string>("VEHICLE_LOOKUP_API_URL")),
      mode: provider === "custom" ? "API" : "DEMO",
      registrationPrimary: true,
      firstRegistrationDateOptional: true,
      vinOptional: true,
    };
  }

  private normalizeRegistration(value: string) {
    const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (compact.length !== 6) return value.toUpperCase().trim();
    return `${compact.slice(0, 2)}-${compact.slice(2, 4)}-${compact.slice(4, 6)}`;
  }

  private async lookupCustomApi(registrationNumber: string, dto: LookupVehicleDto): Promise<VehicleLookupResult> {
    const baseUrl = this.configService.get<string>("VEHICLE_LOOKUP_API_URL");
    if (!baseUrl) {
      throw new BadGatewayException("O fornecedor de dados automóveis não está configurado.");
    }

    const url = new URL(baseUrl);
    url.searchParams.set("registrationNumber", registrationNumber);
    if (dto.firstRegistrationDate) url.searchParams.set("firstRegistrationDate", dto.firstRegistrationDate);
    if (dto.vin) url.searchParams.set("vin", dto.vin.toUpperCase());
    if (dto.vehicleType) url.searchParams.set("vehicleType", dto.vehicleType);

    const apiKey = this.configService.get<string>("VEHICLE_LOOKUP_API_KEY");
    const response = await fetch(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });

    if (!response.ok) {
      throw new BadGatewayException(`O fornecedor de dados automóveis respondeu com o estado ${response.status}.`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<Partial<VehicleCandidate>>;
      data?: Array<Partial<VehicleCandidate>>;
      message?: string;
    };
    const rawCandidates = payload.candidates ?? payload.data ?? [];
    const candidates = rawCandidates
      .filter((item) => item.make && item.model)
      .map((item, index): VehicleCandidate => ({
        id: item.id || `custom-${registrationNumber}-${index + 1}`,
        registrationNumber,
        make: String(item.make),
        model: String(item.model),
        version: item.version ?? null,
        firstRegistrationDate: item.firstRegistrationDate ?? dto.firstRegistrationDate ?? null,
        year: item.year ?? null,
        fuelType: item.fuelType ?? null,
        bodyType: item.bodyType ?? null,
        engineCapacityCc: item.engineCapacityCc ?? null,
        powerKw: item.powerKw ?? null,
        powerHp: item.powerHp ?? null,
        transmission: item.transmission ?? null,
        seats: item.seats ?? null,
        vin: item.vin ?? dto.vin ?? null,
        confidence: item.confidence ?? "MEDIUM",
      }));

    return {
      registrationNumber,
      status: candidates.length === 0 ? "NOT_FOUND" : candidates.length === 1 ? "FOUND" : "MULTIPLE",
      source: "CUSTOM_API",
      requiresFirstRegistrationDate: candidates.length > 1 && !dto.firstRegistrationDate,
      candidates,
      message: payload.message || (candidates.length ? "Veículo identificado pelo fornecedor configurado." : "O fornecedor não encontrou resultados."),
    };
  }
}
