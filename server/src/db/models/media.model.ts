import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../dbConfig'
import Post from './post.model'

export default class Media extends Model {
  public id!: number
  public media!: Buffer
  public mimeType!: MimeType
  public posts: Post[] = []
  public postKey!: string

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export enum MimeType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  MP4 = 'video/mp4'
}

export const MIME_TYPES = new Set<string>(Object.values(MimeType))

Media.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    media: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postKey: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    }
  },
  {
    tableName: 'medias',
    sequelize,
    timestamps: true
  }
)
