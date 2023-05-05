import {UserAuthRepository} from "../repository/userAuth.repository";

export class UserAuthService {

    private userAuthRepository: UserAuthRepository;

    constructor() {
        this.userAuthRepository = new UserAuthRepository();
    }

    async getUserAuth(userEmail) {
        return await this.userAuthRepository.getUserAuth(userEmail);
    }

    async createUserAuth(user) {
        return await this.userAuthRepository.createUserAuth(user);
    }

    async updateUserAuth(user) {
        return await this.userAuthRepository.updateUserAuth(user);
    }

    async deleteUserAuth(userId) {
        return await this.userAuthRepository.deleteUserAuth(userId);
    }

}