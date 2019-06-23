import {
  AutoIncrement,
  Column,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'company_address',
})
export class CompanyAddress extends Model<CompanyAddress> {
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
