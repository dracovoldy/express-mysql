const mysql = require('mysql');

const config = {
    connectionLimit : 10,
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'labpass',
    database: 'labdb',
    multipleStatements: true
};

// Create a MySQL pool
const pool = mysql.createPool(config);
// Export the pool
module.exports = pool;
