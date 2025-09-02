import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


const pool = mysql.createPool({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT || 3306),
user: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
connectionLimit: 10,
namedPlaceholders: true
});


export async function query(sql, params = {}) {
const [rows] = await pool.execute(sql, params);
return rows;
}


export default pool;