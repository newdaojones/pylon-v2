import { prisma } from '@/db';
import {
  BridgeComplianceLinksResponse,
  BridgeComplianceTypeEnum,
} from '../types/bridge';
import { BridgeService } from './external/Bridge';
import { UUID } from 'crypto';
import { PrismaMerchant } from '../types/prisma';
import { AddressType } from '@prisma/client';

const bridgeService = BridgeService.getInstance();

export class MerchantService {
  private static instance: MerchantService;

  public static getInstance(): MerchantService {
    if (!MerchantService.instance) {
      MerchantService.instance = new MerchantService();
    }
    return MerchantService.instance;
  }

  /** @dev create partner */
  public async createPartner(partnerData: any): Promise<PrismaMerchant | null> {
    const {
      name,
      surname,
      email,
      phoneNumber,
      companyNumber,
      companyJurisdiction,
      fee,
      walletAddress,
      registeredAddress,
    } = partnerData;

    const { street1, street2, city, postcode, state, country } =
      registeredAddress;

    try {
      const merchant: PrismaMerchant = await prisma.merchant.create({
        data: {
          name,
          surname,
          email,
          phoneNumber,
          companyNumber,
          companyJurisdiction,
          fee,
          walletAddress,
          registeredAddress: {
            create: {
              type: AddressType.REGISTERED,
              street1,
              street2,
              city,
              postcode,
              state,
              country,
            },
          },
        },
      });

      return merchant;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /** @dev register kyb partner via compliance partner */
  public async registerCompliancePartner(
    merchantUuid: UUID,
    fullName: string,
    email: string
  ): Promise<BridgeComplianceLinksResponse | null> {
    try {
      const registered: BridgeComplianceLinksResponse =
        await bridgeService.createComplianceLinks(
          merchantUuid,
          fullName,
          BridgeComplianceTypeEnum.Business,
          email
        );

      return registered;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
