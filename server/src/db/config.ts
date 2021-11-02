import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("faker", "postgres", "jackpot", {
    host: "localhost",
    port: 5432,
    dialect: "postgres",
})