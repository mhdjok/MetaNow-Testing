import { Sequelize } from "sequelize";

// create connection
const db = new Sequelize('metanow', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

// export connection
export default db;