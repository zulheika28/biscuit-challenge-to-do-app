import { APILogger } from '../logger/api.logger';
import { UserAuthService } from '../service/userAuth.service';

export class UserAuthController {

    private userAuthService: UserAuthService;
    private logger: APILogger;

    constructor() {
        this.userAuthService = new UserAuthService();
        this.logger = new APILogger()
    }

    async getUserAuth(userEmail) {
        this.logger.info('Controller: getUserAuth', null)
        return await this.userAuthService.getUserAuth(userEmail);
    }

    async createUserAuth(userAuth) {
        this.logger.info('Controller: createUserAuth', userAuth);
        return await this.userAuthService.createUserAuth(userAuth);
    }

    async updateUserAuth(user) {
        this.logger.info('Controller: updateUserAuth', user);
        return await this.userAuthService.updateUserAuth(user);
    }

    async deleteUserAuth(taskId) {
        this.logger.info('Controller: deleteUserAuth', taskId);
        return await this.userAuthService.deleteUserAuth(taskId);
    }
}