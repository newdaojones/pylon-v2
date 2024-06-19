import { FastifyInstance } from 'fastify';
import { methods } from '@/helpers/constants';
import {
  AuthenticateDeviceWithWebAuthnSchema,
  RegisterDeviceWithWebAuthnSchema,
  SendWebAuthnChallengeSchema,
} from '../schemas/authentication';
import {
  authenticateDeviceWithWebAuthn,
  registerDeviceWithWebAuthn,
  sendChallenge,
} from '../handlers/authentication';

const Authentication = async (app: FastifyInstance) => {
  /**
   * @description Send a challenge to the client
   * @param {FastifyRequestTypebox<typeof SendWebAuthnChallengeSchema>} req
   */
  app
    .route({
      method: methods.GET,
      url: '/challenge',
      schema: SendWebAuthnChallengeSchema,
      handler: sendChallenge,
    })
    /**
     * @description Register a device with WebAuthn
     * @param {FastifyRequestTypebox<typeof RegisterDeviceWithWebAuthnSchema>} req
     */
    .route({
      method: methods.POST,
      url: '/register',
      schema: RegisterDeviceWithWebAuthnSchema,
      handler: registerDeviceWithWebAuthn,
    })
    /**
     * @description Authenticate a device with WebAuthn
     */
    .route({
      method: methods.POST,
      url: '/authenticate',
      schema: AuthenticateDeviceWithWebAuthnSchema,
      handler: authenticateDeviceWithWebAuthn,
    });
};

export default Authentication;
