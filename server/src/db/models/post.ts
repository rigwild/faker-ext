import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config";

export default class Post extends Model {
    public id!: number;
    public content!: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Post.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: new DataTypes.TEXT(),
            allowNull: false
        }
    }, {
        tableName: "posts",
        sequelize,
        timestamps: true
    }
)