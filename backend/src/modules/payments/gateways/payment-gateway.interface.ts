export interface CreateChargeInput {
  invoiceId: bigint;
  amount: number;
  customerId: string;
  description: string;
}

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
}

export interface ChargeResponse {
  externalId: string;
  paymentUrl?: string;
  pixQrCode?: string;
  rawResponse?: any;
}

export interface PaymentGateway {
  createCharge(input: CreateChargeInput): Promise<ChargeResponse>;

  createCustomer(input: CreateCustomerInput): Promise<string>;

  getCharge(externalId: string): Promise<any>;

  cancelCharge(externalId: string): Promise<void>;
}
