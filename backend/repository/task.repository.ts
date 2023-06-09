import { connect } from "../config/db.config";
import { Tasks } from "../model/task.model";

export class TaskRepository {

    private db: any = {};
    private taskRespository: any;

    constructor() {
        this.db = connect();
        // For Development
        this.db.sequelize.sync({ force: true }).then(() => {
            console.log("Drop and re-sync db.");
        });
        this.taskRespository = this.db.sequelize.getRepository(Tasks);
    }

    async getTasks() {
        
        try {
            const tasks = await this.taskRespository.findAll();
            console.log('tasks:::', tasks);
            return tasks;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async createTask(task) {
        let data = {};
        try {
            task.createdate = new Date().toISOString();
            task.status = 'Not Started';
            data = await this.taskRespository.create(task);
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    async updateTask(task) {
        let data = {};
        try {
            task.updateddate = new Date().toISOString();
            data = await this.taskRespository.update({...task}, {
                where: {
                    id: task.id
                }
            });
        } catch(err) {
            console.log(err);
        }
        return data;
    }

    async deleteTask(taskId) {
        let data = {};
        try {
            data = await this.taskRespository.destroy({
                where: {
                    id: taskId
                }
            });
        } catch(err) {
            console.log(err);
        }
        return data;
    }

}