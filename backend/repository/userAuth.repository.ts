import { connect } from "../config/user.db.config";
import { UserAuth } from "../model/userAuth.model";

export class UserAuthRepository {

    private db: any = {};
    private userAuthRespository: any;

    constructor() {
        this.db = connect();
        // For Development
        this.db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
        });
        this.userAuthRespository = this.db.sequelize.getRepository(UserAuth);
    }

    async getUserAuth(userEmail) {

        let data = {};
        try {
            data = await this.userAuthRespository.findAll({
                where: {
                    email: userEmail
                }
            });
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    async createUserAuth(user) {
        let data = {};
        try {
            data = await this.userAuthRespository.create(user);
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    async updateUserAuth(user) {
        let data = {};
        try {
            data = await this.userAuthRespository.update({...user}, {
                where: {
                    id: user.id
                }
            });
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    async deleteUserAuth(userId) {
        let data = {};
        try {
            data = await this.userAuthRespository.destroy({
                where: {
                    id: userId
                }
            });
        } catch(err) {
            console.log(err);
        }
        return data;
    }

}