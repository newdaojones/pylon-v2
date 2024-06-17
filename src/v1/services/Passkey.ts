import crypto from 'crypto';
import type {
  AuthenticationEncoded,
  CredentialKey,
  PasswordlessServer,
  RegistrationEncoded,
} from '@/v1/types/webauthn';
import type {
  AuthenticationChecks,
  RegistrationChecks,
} from '@/v1/types/webauthn';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PasskeyError, PrismaError } from './Error';
import { ERROR400, ERROR401 } from '@/helpers/constants';
import { prisma } from '@/db';

export class PasskeyService {
  private static instance: PasskeyService;
  private server?: PasswordlessServer;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    this.server = (await import(
      '@passwordless-id/webauthn/dist/esm/index.js'
    )) as any as PasswordlessServer;
  }

  public static getInstance(): PasskeyService {
    if (!PasskeyService.instance) {
      PasskeyService.instance = new PasskeyService();
    }
    return PasskeyService.instance;
  }

  public async generateChallenge() {
    // Generate a random challenge
    const randomBuffer = new Uint8Array(32);

    crypto.randomFillSync(randomBuffer);
    return Buffer.from(randomBuffer).toString('hex');
  }

  public async registerDeviceWithWebAuthn(
    registration: RegistrationEncoded,
    expected: RegistrationChecks,
    email: string,
    passKeyName?: string
  ) {
    try {
      if (!this.server) {
        throw new PrismaError(500, 'WebAuthn server not initialized');
      }

      // Return the verified credentials
      const verified = await this.server.verifyRegistration(
        registration,
        expected
      );

      //  Create a new user with the verified credentials and the email provided

      const user = await prisma.user.create({
        data: {
          username: verified.username,
          email: email,
          // Create a new registered device with the verified credentials
          RegisteredDevices: {
            create: {
              credentialId: verified.credential.id,
              publicKey: verified.credential.publicKey,
              algorithm: verified.credential.algorithm,
              name: passKeyName,
            },
          },
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaError(ERROR400.statusCode, error.message);
      } else {
        throw new PasskeyError(ERROR400.statusCode, (error as Error).message);
      }
    }
  }

  public async authenticateDeviceWithWebAuthn(
    authentication: AuthenticationEncoded,
    expected: AuthenticationChecks
  ) {
    try {
      if (!this.server) {
        throw new PrismaError(500, 'WebAuthn server not initialized');
      }

      const registeredDevice = await prisma.registeredDevice.findUnique({
        where: {
          credentialId: authentication.credentialId,
        },
        include: {
          user: true,
        },
      });

      if (!registeredDevice) {
        throw new PrismaError(ERROR400.statusCode, 'Device not registered');
      }
      const credentialKey: CredentialKey = {
        id: registeredDevice.credentialId,
        algorithm: registeredDevice.algorithm,
        publicKey: registeredDevice.publicKey,
      };

      // Return the verified credentials
      await this.server.verifyAuthentication(
        authentication,
        credentialKey,
        expected
      );

      return registeredDevice?.user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new PrismaError(ERROR400.statusCode, error.message);
      } else {
        throw new PasskeyError(ERROR401.statusCode, (error as Error).message);
      }
    }
  }
}