import { Injectable } from '@nestjs/common';

import { AsaasGateway } from './asaas.gateway.js';
import { payment_gateway } from '../../../generated/prisma/client.js';

@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private readonly asaasGateway: AsaasGateway,
    //private readonly stripeGateway: StripeGateway,
    //private readonly mercadoPagoGateway: MercadoPagoGateway,
  ) {}

  getGateway(provider: payment_gateway) {
    switch (provider) {
      case payment_gateway.ASAAS:
        return this.asaasGateway;

      case payment_gateway.STRIPE:
      //return this.stripeGateway;

      case payment_gateway.MERCADO_PAGO:
      //return this.mercadoPagoGateway;

      default:
        throw new Error(`Gateway ${provider} not supported`);
    }
  }
}
