// import sequelize
import { Sequelize } from "sequelize";
// import connection
import db from "../config/database.js";

// init DataTypes
const { DataTypes } = Sequelize;

// Define schema
const Users = db.define('users', {
    // Define attributes
    fullname: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    socket_id: {
        type: DataTypes.STRING
    },
    last_seen: {
        type: DataTypes.STRING
    },
    profile_image: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },

},{
    // Freeze Table Name
    underscored: true,
    freezeTableName: true
});

// Export model Product
export default Users;
