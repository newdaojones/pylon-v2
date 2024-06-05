export default class PasswordlessIdService {
  private static instance: PasswordlessIdService;

  public static getInstance = () => {
    if (!PasswordlessIdService.instance) {
      PasswordlessIdService.instance = new PasswordlessIdService();
    }
    return PasswordlessIdService.instance;
  };

  public async getServer() {
    const server = await require('@passwordless-id/webauthn/dist/esm/server');
    return server;
  }
}