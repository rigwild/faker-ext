import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../dbConfig'

export default class ApiUser extends Model {
  public id!: number
  public name!: string
  public password?: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

ApiUser.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: new DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
        type: new DataTypes.STRING,
        allowNull: false,
    },
  },
  {
    tableName: 'api_users',
    sequelize,
    timestamps: true
  }
)
