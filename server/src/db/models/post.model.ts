import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../dbConfig'

export default class Post extends Model {
  public id!: string
  public content!: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: {
      type: new DataTypes.TEXT(),
      allowNull: false
    }
  },
  {
    tableName: 'posts',
    sequelize,
    timestamps: true
  }
)
