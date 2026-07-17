export class CreateClientDto {
  name: string;

  nif?: string;

  birthDate?: Date;

  email?: string;

  phone?: string;

  address?: string;

  postalCode?: string;

  city?: string;

  notes?: string;

  companyId: number;
}