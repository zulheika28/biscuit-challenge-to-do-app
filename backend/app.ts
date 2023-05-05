import * as bodyParser from "body-parser";
import * as express from "express";
import { APILogger } from "./logger/api.logger";
import { TaskController } from "./controller/task.controller";
import { UserAuthController } from "./controller/userAuth.controller";
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import 'dotenv/config'
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { validateHasParameters, validateEmailFormat, validatePasswordLength } from "./middleware/validation";
const ENCRYPTION_KEY  = process.env.ENCRYPTION_KEY;
const AUTH_TOKEN_KEY  = process.env.AUTH_TOKEN_KEY;
import * as cors from 'cors';
import {checkAuthToken} from "./middleware/auth";

class App {

    public express: express.Application;
    public logger: APILogger;
    public taskController: TaskController;
    public userController: UserAuthController;

    /* Swagger files start */
    private swaggerFile: any = (process.cwd()+"/swagger/swagger.json");
    private swaggerData: any = fs.readFileSync(this.swaggerFile, 'utf8');
    private customCss: any = fs.readFileSync((process.cwd()+"/swagger/swagger.css"), 'utf8');
    private swaggerDocument = JSON.parse(this.swaggerData);
    /* Swagger files end */


    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.logger = new APILogger();
        this.taskController = new TaskController();
        this.userController = new UserAuthController();
    }

    // Configure Express middleware.

    private options: cors.CorsOptions = {
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'X-Access-Token',
        ],
        credentials: true,
        methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
        origin: 'http://localhost:3000',
        preflightContinue: false,
    };
    private middleware(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cors(this.options));
    }

    private routes(): void {

        this.express.get('/api/tasks',checkAuthToken,  (req, res) => {
            this.taskController.getTasks().then(data => res.json(data));
        });
        
        this.express.post('/api/task', checkAuthToken, (req, res) => {
            console.log(req.body);
            this.taskController.createTask(req.body.task).then(data => res.json(data));
        });
        
        this.express.put('/api/task', checkAuthToken,  (req, res) => {
            this.taskController.updateTask(req.body.task).then(data => res.json(data));
        });
        
        this.express.delete('/api/task/:id', checkAuthToken, (req, res) => {
            this.taskController.deleteTask(req.params.id).then(data => res.json(data));
        });

        //user auth

        this.express.get('/api/user/:email', (req, res) => {
            this.userController.getUserAuth(req.params.email).then(data => res.json(data));
        });

        this.express.post('/api/user', (req, res) => {
            console.log(req.body);
            this.userController.createUserAuth(req.body.user).then(data => res.json(data));
        });

        //user register
        this.express.post("/api/register",
            validateHasParameters("email", "password", "name"),
            validateEmailFormat,
            validatePasswordLength,
            async (req, res) => {
                const { name, email, password } = req.body;
                try {
                    const userExist = await this.userController.getUserAuth(email);
                    if (userExist[0]) {
                        return res.status(409).json({ error: "User already exist" });
                    }

                    const date = new Date().toISOString();

                    // Encrypt user password
                    const passwordHash = await bcrypt.hash(password, ENCRYPTION_KEY!);

                    // Create auth token with user info and expiry date
                    const userData = {
                        user:{
                            name: name,
                            email: email,
                            password: passwordHash,
                            createdAt: date,
                            updatedAt: date,
                        }
                    };

                    // Persist user data
                    await this.userController.createUserAuth(userData);

                    const jwtOptions = {
                        expiresIn: '24h',  // Expire token in 24 hours
                    };

                    const authToken = jwt.sign(userData.user, AUTH_TOKEN_KEY!, jwtOptions);

                    return res.status(200).json({
                        success: true,
                        user: {
                            email: userData.user.email,
                            name: userData.user.name,
                            auth_token: authToken,
                        },
                    });
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ error: `Internal Error` });
                }
            });

        //user login authenticate
        this.express.post("/api/login",
            validateHasParameters("email", "password"),
            async (req, res) => {
                const { email, password } = req.body;

                try {
                    // Check if user exist AND password supplied is correct
                    const user = await this.userController.getUserAuth(email);
                    const userExists = !!user;
                    const passwordCorrect = userExists && (await bcrypt.compare(password, user[0].password));
                    if(userExists && passwordCorrect) {

                        const jwtOptions = {
                            expiresIn: '24h',  // Expire token in 24 hours
                        };

                        const authToken = jwt.sign(user[0], AUTH_TOKEN_KEY!, jwtOptions);

                        return res.status(200).json({
                            success: true,
                            user: {
                                user_id: user[0].id,
                                email: user[0].email,
                                name: user[0].name,
                                auth_token: authToken,
                            },
                        });
                    }

                    return res.status(400).json({error: 'Invalid Credentials'});
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ error: `Server Error` });
                }
            });

        this.express.delete('/api/user/:id', checkAuthToken, (req, res) => {
            this.userController.deleteUserAuth(req.params.id).then(data => res.json(data));
        });

        this.express.get("/", (req, res, next) => {
            res.send("Typescript App works!!");
        });

        // swagger docs
        this.express.use('/api/docs', swaggerUi.serve,
            swaggerUi.setup(this.swaggerDocument, null, null, this.customCss));

        // handle undefined routes
        this.express.use("*", (req, res, next) => {
            res.send("Url does not exist");
        });
    }
}

export default new App().express;