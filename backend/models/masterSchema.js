import { v4 as uuidv4 } from 'uuid';
import { getMasterPool } from '../config/database.js';

export async function initMasterDB() {
  const pool = getMasterPool();

  await pool.execute(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    userId VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    role ENUM('SUPER_ADMIN','SOCIETY_ADMIN','STAFF','VENDOR','RESIDENT') DEFAULT 'STAFF',
    societyId VARCHAR(36) DEFAULT NULL,
    permissions JSON DEFAULT NULL,
    fcmToken TEXT DEFAULT NULL,
    firstLogin BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_userId (userId), INDEX idx_role (role), INDEX idx_societyId (societyId)
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS societies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT, city VARCHAR(100) DEFAULT '', state VARCHAR(100) DEFAULT '',
    pincode VARCHAR(20) DEFAULT '', phone VARCHAR(50) DEFAULT '', email VARCHAR(255) DEFAULT '',
    registrationNo VARCHAR(100) DEFAULT '', totalTowers INT DEFAULT 0, totalFlats INT DEFAULT 0,
    societyType ENUM('residential','commercial','mixed') DEFAULT 'residential',
    description TEXT, establishedYear VARCHAR(10) DEFAULT '',
    builderName VARCHAR(255) DEFAULT '', amenities JSON,
    billingPeriod ENUM('monthly','quarterly','yearly') DEFAULT 'monthly',
    maintenanceAmount VARCHAR(50) DEFAULT '',
    status ENUM('active','inactive') DEFAULT 'active',
    dbName VARCHAR(255) DEFAULT '',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city), INDEX idx_status (status)
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(36) PRIMARY KEY, societyId VARCHAR(36) DEFAULT NULL,
    name VARCHAR(255) NOT NULL, description TEXT,
    permissions JSON DEFAULT NULL, status ENUM('active','inactive') DEFAULT 'active',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_societyId (societyId)
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(36) PRIMARY KEY, teamId VARCHAR(36) NOT NULL, userId VARCHAR(36) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_teamId (teamId), INDEX idx_userId (userId)
  )`);

  await pool.execute(`CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY, societyId VARCHAR(36) DEFAULT NULL,
    title VARCHAR(255) NOT NULL, body TEXT,
    type VARCHAR(50) DEFAULT 'general', targetUserId VARCHAR(36) DEFAULT NULL,
    sentBy VARCHAR(36) DEFAULT NULL, isRead BOOLEAN DEFAULT FALSE,
    fcmMessageId VARCHAR(255) DEFAULT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_targetUserId (targetUserId), INDEX idx_societyId (societyId)
  )`);

  // Seed super admin
  const [admins] = await pool.execute("SELECT id FROM users WHERE userId='admin001'");
  if (admins.length === 0) {
    await pool.execute(
      'INSERT INTO users (id,name,userId,password,email,phone,role,permissions,firstLogin) VALUES (?,?,?,?,?,?,?,?,?)',
      [uuidv4(), 'Super Admin', 'admin001', 'admin123', 'admin@test.com', '9999999999', 'SUPER_ADMIN', JSON.stringify(['FULL_ACCESS']), false]
    );
    console.log('[DB] Super admin seeded');
  }
  console.log('[DB] Master database initialized');
}
