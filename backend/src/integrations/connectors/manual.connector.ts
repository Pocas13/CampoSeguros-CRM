import type { InsurerConnector, InsurerQuoteRequest, InsurerQuoteResponse } from "./insurer-connector.interface";

export class ManualInsurerConnector implements InsurerConnector {
  readonly code = "MANUAL";
  readonly mode = "MANUAL" as const;
  async requestQuote(_input: InsurerQuoteRequest): Promise<InsurerQuoteResponse> { return { status: "REQUESTED" }; }
  async testConnection() { return { ok: true, message: "Modo manual assistido disponível." }; }
}
