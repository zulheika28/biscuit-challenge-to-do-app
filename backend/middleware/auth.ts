// Global dependencies
import jwt, { JwtPayload } from 'jsonwebtoken';
const { AUTH_TOKEN_KEY } = process.env;
import {UserAuthRepository} from '../repository/userAuth.repository';


export const checkAuthToken = async (req: any, res: any, next: any) => {
    const auth_token = req.headers["x-access-token"] as string;
    let userAuthRepository = new UserAuthRepository();
    try {
        if (!auth_token) {
            throw new Error('Unauthorized');
        }

        const decodedUserInfo = jwt.verify(auth_token, AUTH_TOKEN_KEY!) as JwtPayload;
        // Check if user actually exist in db
        const user = await userAuthRepository.getUserAuth(decodedUserInfo.email);
        if(!user) {
            throw new Error('Unauthorized');
        }

        req.user = {...user[0], ...decodedUserInfo};
    } catch (error) {
        return res.status(403).json({error: 'Unauthorized'});
    }

    return next();
};