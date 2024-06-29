import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';
import { utils } from '@/helpers/utils';
import { ERROR500, STANDARD } from '@/helpers/constants';

import Merchant from './merchant';
import Bridge from './bridge';
import Transaction from './transaction';
import Auth from './auth';

const Home = async (app: FastifyInstance) => {
  app
    .all(
      '/',
      {
        schema: {
          hide: true,
        },
      },
      async (req: FastifyRequest, rep: FastifyReply) => {
        rep.code(STANDARD.SUCCESS).send({ ok: true });
      }
    )

    .get('/health-check', async (req: FastifyRequest, rep: FastifyReply) => {
      try {
        await utils.healthCheck(); //status 200
        rep.code(STANDARD.SUCCESS).send({ message: 'Success' });
      } catch (e) {
        rep.code(ERROR500.statusCode);
      }
    });
};

export { Home, Merchant, Bridge, Transaction, Auth };
