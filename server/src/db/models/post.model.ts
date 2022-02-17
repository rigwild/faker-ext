import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../dbConfig'

export default class Post extends Model {
  public id!: number
  public content!: string
  public postKey!: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: new DataTypes.TEXT(),
      allowNull: false
    },
    postKey: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    }
  },
  {
    tableName: 'posts',
    sequelize,
    timestamps: true
  }
)
