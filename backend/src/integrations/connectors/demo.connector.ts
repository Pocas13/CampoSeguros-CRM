import type { InsurerConnector, InsurerQuoteRequest, InsurerQuoteResponse, PortfolioRecord } from "./insurer-connector.interface";

export class DemoInsurerConnector implements InsurerConnector {
  readonly code = "DEMO";
  readonly mode = "API" as const;

  async requestQuote(input: InsurerQuoteRequest): Promise<InsurerQuoteResponse> {
    return { externalReference: `DEMO-${input.quoteId}`, status: "RECEIVED", annualPremium: 384.5, deductible: 250, coverages: { civilLiability: true, assistance: true } };
  }

  async testConnection() { return { ok: true, message: "Ligação de demonstração operacional." }; }

  async fetchPortfolio(): Promise<PortfolioRecord[]> {
    const year = new Date().getFullYear();
    return [
      {
        externalId: "DEMO-POL-001",
        policyNumber: `DEMO-AUTO-${year}`,
        product: "Automóvel",
        branch: "AUTO",
        premium: 486.3,
        commission: 58.36,
        startDate: `${year}-01-15`,
        renewalDate: `${year + 1}-01-15`,
        client: { name: "Cliente Importado API", nif: "245678901", email: "importado.api@teste.pt", phone: "910000001", city: "Porto", type: "INDIVIDUAL" },
      },
      {
        externalId: "DEMO-POL-002",
        policyNumber: `DEMO-CASA-${year}`,
        product: "Multirriscos Habitação",
        branch: "HABITACAO",
        premium: 221.75,
        commission: 33.26,
        startDate: `${year}-03-01`,
        renewalDate: `${year + 1}-03-01`,
        client: { name: "Empresa Importada API, Lda.", nif: "509876543", email: "empresa.importada@teste.pt", city: "Gaia", type: "BUSINESS" },
      },
    ];
  }
}
