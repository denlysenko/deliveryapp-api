import { AutoIncrement, Column, Model, PrimaryKey } from 'sequelize-typescript';

export abstract class BaseEntity<T> extends Model<T> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;
}
