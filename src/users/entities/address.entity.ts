import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'addresses',
})
export class Address extends Model<Address> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  country: string;

  @Column
  city: string;

  @Column
  street: string;

  @Column
  house: string;
}
