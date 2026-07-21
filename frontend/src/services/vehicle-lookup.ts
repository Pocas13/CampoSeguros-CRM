import { api } from "./api";

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

export type VehicleLookupStatus = {
  provider: string;
  configured: boolean;
  mode: "API" | "DEMO";
  registrationPrimary: boolean;
  firstRegistrationDateOptional: boolean;
  vinOptional: boolean;
};

export async function lookupVehicle(data: {
  registrationNumber: string;
  firstRegistrationDate?: string | null;
  vin?: string | null;
  vehicleType: "AUTO" | "MOTORCYCLE";
}) {
  return (await api.post<VehicleLookupResult>("/vehicle-lookup/registration", data)).data;
}

export async function getVehicleLookupStatus() {
  return (await api.get<VehicleLookupStatus>("/vehicle-lookup/status")).data;
}
