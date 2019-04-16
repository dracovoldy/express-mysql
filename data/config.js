const mysql = require('mysql');

const config = {
    host: 'localhost',
    port: '3306',
    user: 'labdev',
    password: 'labpass',
    database: 'limsdb',
};

// Create a MySQL pool
const pool = mysql.createPool(config);
// Export the pool
module.exports = pool;
