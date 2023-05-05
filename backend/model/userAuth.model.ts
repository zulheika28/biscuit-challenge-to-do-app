import { Table, Column, Model, HasMany } from 'sequelize-typescript'

@Table
export class UserAuth extends Model {
  
  @Column
  name: string

  @Column
  email: string

  @Column
  password: string;

}