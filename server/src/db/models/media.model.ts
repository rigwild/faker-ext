import * as fs from 'fs'
import * as path from 'path'
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../dbConfig'
import Post from './post.model'

export default class Media extends Model {
  public id!: number
  public media!: Buffer
  public mimType!: MimType
  public posts: Post[] = []

  // timestamps!
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

export enum MimType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  MP4 = 'video/mp4'
}

export const MIM_TYPES = new Set<string>(Object.values(MimType))

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
    mimType: {
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
