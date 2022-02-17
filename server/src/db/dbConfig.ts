import { Dialect, Sequelize } from 'sequelize'

const dbName = process.env.DB_NAME!
const dbUser = process.env.DB_USER!
const dbHost = process.env.DB_HOST!
const dbPort = +process.env.DB_PORT!
const dbDriver = process.env.DB_DRIVER as Dialect
const dbPassword = process.env.DB_PASSWORD!

if (!dbName || !dbUser || !dbHost || !dbPort || !dbDriver || !dbPassword) {
  throw new Error(
    `Missing DB credentials dbName: ${dbName}, dbUser: ${dbUser}, dbHost: ${dbHost}, dbPort: ${dbPort}, dbDriver: ${dbDriver}, dbPassword: ${dbPassword}`
  )
}

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDriver
})
