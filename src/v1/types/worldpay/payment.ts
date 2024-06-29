import { ISO4217Currency } from '../transaction';

export type WorldpayAuthorizePaymentRequest = {
  transactionReference: string;
  merchant: {
    entity: string;
  };
  instruction: {
    requestAutoSettlement: {
      enabled: boolean;
    };
    narrative: {
      line1: string;
    };
    value: {
      currency: ISO4217Currency;
      amount: number;
    };
    paymentInstrument: {
      type: string;
      tokenHref: string;
      cvcHref?: string;
    };
  };
  channel: WorldpayPaymentChannelType;
};

export type WorldpayAuthorizePaymentResponse = {
  outcome: string;
  riskFactors: {
    type: string;
    risk: string;
    detail?: string;
  }[];
  issuer: {
    authorizationCode: string;
  };
  scheme: {
    reference: string;
  };
  paymentInstrument: {
    type: string;
    card: {
      number: {
        bin: string;
        last4Digits: string;
      };
      category: string;
      brand: string;
      fundingType: string;
      issuer: {
        name: string;
      };
      paymentAccountReference: string;
    };
  };
  _links: {
    [key: string]: {
      href: string;
    };
  };
};

export type WorldpayQueryPaymentStatusResponse = {
  lastEvent: string;
  _links: {
    [key: string]: {
      href: string;
    };
  };
};

export enum WorldpayPaymentInstrumentType {
  CHECKOUT = 'card/checkout',
  PLAIN = 'card/plain',
}

export enum WorldpayPaymentChannelType {
  ECOM = 'ecom',
  MOTO = 'moto',
}