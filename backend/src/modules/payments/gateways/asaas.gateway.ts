import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

import {
  ChargeResponse,
  CreateChargeInput,
  CreateCustomerInput,
  PaymentGateway,
} from './payment-gateway.interface.js';

@Injectable()
export class AsaasGateway implements PaymentGateway {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async createCustomer(input: CreateCustomerInput): Promise<string> {
    try {
      const baseUrl = this.config.getOrThrow<string>('ASAAS_API_URL');

      const apiKey = this.config.getOrThrow<string>('ASAAS_API_KEY');

      const response = await firstValueFrom(
        this.http.post(
          `${baseUrl}/customers`,
          {
            name: input.name,
            email: input.email,
            phone: input.phone,
            cpfCnpj: input.cpfCnpj,
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              access_token: apiKey,
            },
          },
        ),
      );

      return response.data.id;
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar cliente no Asaas');
    }
  }

  async createCharge(input: CreateChargeInput): Promise<ChargeResponse> {
    try {
      const baseUrl = this.config.getOrThrow<string>('ASAAS_API_URL');

      const apiKey = this.config.getOrThrow<string>('ASAAS_API_KEY');

      const response = await firstValueFrom(
        this.http.post(
          `${baseUrl}/payments`,
          {
            customer: input.customerId,
            billingType: 'PIX',
            value: input.amount,
            dueDate: new Date().toISOString().split('T')[0],
            description: input.description,
            externalReference: input.invoiceId.toString(),
          },
          {
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              access_token: apiKey,
            },
          },
        ),
      );

      return {
        externalId: response.data.id,
        paymentUrl: response.data.invoiceUrl,
        pixQrCode: response.data.pixQrCode,
        rawResponse: response.data,
      };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar cobrança no Asaas');
    }
  }

  async getCharge(externalId: string) {
    const baseUrl = this.config.getOrThrow<string>('ASAAS_API_URL');

    const apiKey = this.config.getOrThrow<string>('ASAAS_API_KEY');

    const response = await firstValueFrom(
      this.http.get(`${baseUrl}/payments/${externalId}`, {
        headers: {
          access_token: apiKey,
        },
      }),
    );

    return response.data;
  }

  async cancelCharge(externalId: string): Promise<void> {
    const baseUrl = this.config.getOrThrow<string>('ASAAS_API_URL');

    const apiKey = this.config.getOrThrow<string>('ASAAS_API_KEY');

    await firstValueFrom(
      this.http.delete(`${baseUrl}/payments/${externalId}`, {
        headers: {
          access_token: apiKey,
        },
      }),
    );
  }
}
