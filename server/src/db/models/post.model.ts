import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbConfig";
import Media from "./media.model";

export default class Post extends Model {
    public id!: number;
    public content!: string;
    public medias: Media[] = [];
    public mediaIds: number[] | undefined;

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
        },
    }, {
    tableName: "posts",
    sequelize,
    timestamps: true
}
);