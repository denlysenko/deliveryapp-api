import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'company_bank_details',
})
export class CompanyBankDetails extends Model<CompanyBankDetails> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  bin: string;

  @Column
  accountNumber: string;

  @Column
  swift: string;
}
