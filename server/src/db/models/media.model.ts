import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../dbConfig'

export default class Media extends Model {
  public id!: string
  public media!: Buffer
  public mimeType!: MimeType

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
      type: DataTypes.UUIDV4,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    media: {
      type: DataTypes.BLOB,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'medias',
    sequelize,
    timestamps: true
  }
)
