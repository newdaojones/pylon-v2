import { FastifyRequestTypebox, FastifyReplyTypebox } from '@/v1/types/fastify';
import { ERRORS } from '@/helpers/errors';
import { CreateMerchantInput } from '../schemas/merchant';
import { ERROR400, ERROR404, ERROR500, STANDARD } from '@/helpers/constants';
import { BridgeService } from '../services/external/Bridge';
import { utils } from '@/helpers/utils';
import { errorResponse, successResponse } from '@/responses';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MerchantService } from '../services/Merchant';
import { ComplianceService } from '../services/Compliance';

const bridgeService = BridgeService.getInstance();
const merchantService = MerchantService.getInstance();
const complianceService = ComplianceService.getInstance();

export async function createMerchantHandler(
  req: FastifyRequestTypebox<typeof CreateMerchantInput>,
  rep: FastifyReplyTypebox<typeof CreateMerchantInput>
): Promise<void> {
  try {
    const merchant = await merchantService.createPartner(req.body);

    const merchantUuid = utils.generateUUID();
    const fullName = utils.getFullName(req.body.name, req.body.surname);
    const registered = await merchantService.registerCompliancePartner(
      merchantUuid,
      fullName,
      req.body.email
    );

    const compliance = complianceService.storePartner(
      merchantUuid,
      registered,
      merchant
    );

    return successResponse(rep, STANDARD.SUCCESS, compliance);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      return errorResponse(req, rep, ERROR400.statusCode, error.message);
    } else {
      return errorResponse(req, rep, ERROR404.statusCode, ERROR404.message);
    }

    // Handle generic errors
    /** @todo handle generic errors in the utils file */
    const errorMessage = 'An error occurred during partner creation';
    return errorResponse(req, rep, ERROR500.statusCode, errorMessage);
  }
}
