import mysql from 'mysql2/promise';

const pools = {};

export function getMasterPool() {
  if (!pools._master) {
    pools._master = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'Macbook@1980',
      database: process.env.MYSQL_MASTER_DB || 'mytower',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      enableKeepAlive: true,
    });
  }
  return pools._master;
}

export function getSocietyPool(societyId) {
  const dbName = `society_${societyId.replace(/-/g, '_')}`;
  if (!pools[dbName]) {
    pools[dbName] = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'Macbook@1980',
      database: dbName,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    });
  }
  return pools[dbName];
}

export async function getRawConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Macbook@1980',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
  });
}

export async function dropSocietyDB(societyId) {
  const dbName = `society_${societyId.replace(/-/g, '_')}`;
  const conn = await getRawConnection();
  try {
    await conn.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
    if (pools[dbName]) { await pools[dbName].end(); delete pools[dbName]; }
  } finally { await conn.end(); }
}

export default { getMasterPool, getSocietyPool, getRawConnection, dropSocietyDB };
