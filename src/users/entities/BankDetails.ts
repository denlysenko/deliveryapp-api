import { AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({
  timestamps: true,
  tableName: 'bank_details',
})
export class BankDetails extends Model<BankDetails> {
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
