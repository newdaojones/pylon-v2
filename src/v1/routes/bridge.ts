import { FastifyInstance } from 'fastify';
import { methods } from '@/helpers/constants';
import { validateAPIKey, authMiddlewareForWebhook } from '../middleware';
import {
  getPrefundedAccountBalance,
  processWebhooksHandler,
} from '../handlers/bridge';
import {
  BridgePrefundedAccountBalanceSchema,
  BridgeWebhookSchema,
} from '../schemas/bridge';

const Bridge = async (app: FastifyInstance) => {
  app
    .route({
      method: methods.GET,
      url: '/prefunded-account-balance',
      schema: BridgePrefundedAccountBalanceSchema,
      preHandler: [],
      handler: getPrefundedAccountBalance,
    })

    .route({
      config: {
        rawBody: true,
      },
      method: methods.POST,
      url: '/webhook',
      schema: BridgeWebhookSchema,
      preHandler: [authMiddlewareForWebhook],
      handler: processWebhooksHandler,
    });
};

export default Bridge;
