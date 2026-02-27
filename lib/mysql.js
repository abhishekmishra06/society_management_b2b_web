import mysql from 'mysql2/promise';

// Connection pools cache
const pools = {};

// Get master database pool
export function getMasterPool() {
  if (!pools._master) {
    pools._master = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root123',
      database: process.env.MYSQL_MASTER_DB || 'society_master',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    });
  }
  return pools._master;
}

// Get society-specific database pool
export function getSocietyPool(societyId) {
  const dbName = `society_${societyId.replace(/-/g, '_')}`;
  if (!pools[dbName]) {
    pools[dbName] = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root123',
      database: dbName,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
    });
  }
  return pools[dbName];
}

// Get a raw connection (no database selected) for creating databases
export async function getRawConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root123',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
  });
}

// Initialize master database tables
export async function initMasterDB() {
  const pool = getMasterPool();
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
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
      INDEX idx_userId (userId),
      INDEX idx_role (role),
      INDEX idx_societyId (societyId)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS societies (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT DEFAULT '',
      city VARCHAR(100) DEFAULT '',
      state VARCHAR(100) DEFAULT '',
      pincode VARCHAR(20) DEFAULT '',
      phone VARCHAR(50) DEFAULT '',
      email VARCHAR(255) DEFAULT '',
      registrationNo VARCHAR(100) DEFAULT '',
      totalTowers INT DEFAULT 0,
      totalFlats INT DEFAULT 0,
      societyType ENUM('residential','commercial','mixed') DEFAULT 'residential',
      description TEXT DEFAULT '',
      establishedYear VARCHAR(10) DEFAULT '',
      builderName VARCHAR(255) DEFAULT '',
      amenities JSON DEFAULT NULL,
      billingPeriod ENUM('monthly','quarterly','yearly') DEFAULT 'monthly',
      maintenanceAmount VARCHAR(50) DEFAULT '',
      status ENUM('active','inactive') DEFAULT 'active',
      dbName VARCHAR(255) DEFAULT '',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_city (city),
      INDEX idx_status (status),
      INDEX idx_societyType (societyType)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(36) PRIMARY KEY,
      societyId VARCHAR(36) DEFAULT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      permissions JSON DEFAULT NULL,
      status ENUM('active','inactive') DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_societyId (societyId)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS team_members (
      id VARCHAR(36) PRIMARY KEY,
      teamId VARCHAR(36) NOT NULL,
      userId VARCHAR(36) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
      INDEX idx_teamId (teamId),
      INDEX idx_userId (userId)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      societyId VARCHAR(36) DEFAULT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT DEFAULT '',
      type VARCHAR(50) DEFAULT 'general',
      targetUserId VARCHAR(36) DEFAULT NULL,
      sentBy VARCHAR(36) DEFAULT NULL,
      isRead BOOLEAN DEFAULT FALSE,
      fcmMessageId VARCHAR(255) DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_targetUserId (targetUserId),
      INDEX idx_societyId (societyId),
      INDEX idx_isRead (isRead)
    )
  `);

  // Seed default super admin if not exists
  const [admins] = await pool.execute("SELECT id FROM users WHERE userId = 'admin001'");
  if (admins.length === 0) {
    const { v4: uuidv4 } = await import('uuid');
    await pool.execute(
      "INSERT INTO users (id, name, userId, password, email, phone, role, permissions, firstLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uuidv4(), 'Super Admin', 'admin001', 'admin123', 'admin@test.com', '9999999999', 'SUPER_ADMIN', JSON.stringify(['FULL_ACCESS']), false]
    );
  }
}

// Create a new society-specific database with all tables
export async function createSocietyDB(societyId) {
  const dbName = `society_${societyId.replace(/-/g, '_')}`;
  const conn = await getRawConnection();
  
  try {
    await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.execute(`USE \`${dbName}\``);

    // Towers
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS towers (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        totalFloors INT DEFAULT 0,
        flatsPerFloor INT DEFAULT 0,
        description TEXT DEFAULT '',
        status ENUM('active','inactive','under_construction') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);

    // Flats
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS flats (
        id VARCHAR(36) PRIMARY KEY,
        towerId VARCHAR(36) DEFAULT NULL,
        towerName VARCHAR(255) DEFAULT '',
        flatNumber VARCHAR(50) NOT NULL,
        floor INT DEFAULT 0,
        type ENUM('1RK','1BHK','2BHK','3BHK','4BHK','5BHK','Penthouse','Shop','Office') DEFAULT '2BHK',
        area VARCHAR(50) DEFAULT '',
        ownerName VARCHAR(255) DEFAULT '',
        ownerPhone VARCHAR(50) DEFAULT '',
        ownerEmail VARCHAR(255) DEFAULT '',
        status ENUM('vacant','occupied','rented','under_maintenance') DEFAULT 'vacant',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (towerId) REFERENCES towers(id) ON DELETE SET NULL,
        INDEX idx_towerId (towerId),
        INDEX idx_status (status),
        INDEX idx_flatNumber (flatNumber)
      )
    `);

    // Residents
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS residents (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        flatNumber VARCHAR(50) DEFAULT '',
        tower VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        type ENUM('owner','tenant','family') DEFAULT 'owner',
        status ENUM('active','inactive') DEFAULT 'active',
        vehicleNumber VARCHAR(50) DEFAULT '',
        aadhaarNumber VARCHAR(20) DEFAULT '',
        moveInDate DATE DEFAULT NULL,
        emergencyContact VARCHAR(50) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_flatNumber (flatNumber)
      )
    `);

    // Complaints
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(100) DEFAULT 'general',
        status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
        priority ENUM('low','medium','high','critical') DEFAULT 'medium',
        reportedBy VARCHAR(255) DEFAULT '',
        flatNumber VARCHAR(50) DEFAULT '',
        assignedTo VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category)
      )
    `);

    // Notices
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS notices (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(100) DEFAULT 'general',
        priority ENUM('low','medium','high') DEFAULT 'medium',
        status ENUM('active','expired','draft') DEFAULT 'active',
        postedBy VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);

    // Visitors
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS visitors (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        purpose VARCHAR(255) DEFAULT '',
        flatNumber VARCHAR(50) DEFAULT '',
        tower VARCHAR(255) DEFAULT '',
        status ENUM('checked_in','checked_out','expected','rejected') DEFAULT 'expected',
        vehicleNumber VARCHAR(50) DEFAULT '',
        checkInTime DATETIME DEFAULT NULL,
        checkOutTime DATETIME DEFAULT NULL,
        approvedBy VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_flatNumber (flatNumber)
      )
    `);

    // Parking
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS parking (
        id VARCHAR(36) PRIMARY KEY,
        slotNumber VARCHAR(50) NOT NULL,
        type ENUM('two_wheeler','four_wheeler','visitor','reserved','ev') DEFAULT 'four_wheeler',
        status ENUM('available','occupied','reserved','maintenance') DEFAULT 'available',
        vehicleNumber VARCHAR(50) DEFAULT '',
        vehicleType VARCHAR(50) DEFAULT '',
        flatNumber VARCHAR(50) DEFAULT '',
        ownerName VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_slotNumber (slotNumber)
      )
    `);

    // Staff
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        department VARCHAR(100) DEFAULT '',
        status ENUM('active','inactive','on_leave') DEFAULT 'active',
        joinDate DATE DEFAULT NULL,
        salary VARCHAR(50) DEFAULT '',
        address TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_department (department),
        INDEX idx_status (status)
      )
    `);

    // Vendors
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) DEFAULT '',
        service VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(255) DEFAULT '',
        status ENUM('active','inactive') DEFAULT 'active',
        address TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);

    // Vendor Contracts
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS vendor_contracts (
        id VARCHAR(36) PRIMARY KEY,
        vendorId VARCHAR(36) DEFAULT NULL,
        vendorName VARCHAR(255) DEFAULT '',
        title VARCHAR(255) NOT NULL,
        startDate DATE DEFAULT NULL,
        endDate DATE DEFAULT NULL,
        amount DECIMAL(12,2) DEFAULT 0,
        status ENUM('active','expired','terminated','pending') DEFAULT 'active',
        description TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE SET NULL,
        INDEX idx_vendorId (vendorId)
      )
    `);

    // Vendor Payments
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS vendor_payments (
        id VARCHAR(36) PRIMARY KEY,
        vendorId VARCHAR(36) DEFAULT NULL,
        vendorName VARCHAR(255) DEFAULT '',
        amount DECIMAL(12,2) DEFAULT 0,
        paymentDate DATE DEFAULT NULL,
        method ENUM('cash','bank_transfer','cheque','upi','online') DEFAULT 'bank_transfer',
        status ENUM('pending','paid','failed','cancelled') DEFAULT 'pending',
        receiptNo VARCHAR(100) DEFAULT '',
        description TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendorId) REFERENCES vendors(id) ON DELETE SET NULL,
        INDEX idx_vendorId (vendorId),
        INDEX idx_status (status)
      )
    `);

    // Billing
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS billing (
        id VARCHAR(36) PRIMARY KEY,
        flatNumber VARCHAR(50) DEFAULT '',
        tower VARCHAR(255) DEFAULT '',
        residentName VARCHAR(255) DEFAULT '',
        amount DECIMAL(12,2) DEFAULT 0,
        type ENUM('maintenance','water','electricity','parking','penalty','other') DEFAULT 'maintenance',
        month VARCHAR(20) DEFAULT '',
        year INT DEFAULT NULL,
        dueDate DATE DEFAULT NULL,
        status ENUM('pending','paid','overdue','partial') DEFAULT 'pending',
        paidDate DATE DEFAULT NULL,
        paidAmount DECIMAL(12,2) DEFAULT 0,
        paymentMethod VARCHAR(50) DEFAULT '',
        receiptNo VARCHAR(100) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_flatNumber (flatNumber),
        INDEX idx_status (status),
        INDEX idx_month_year (month, year)
      )
    `);

    // Billing Payments
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS billing_payments (
        id VARCHAR(36) PRIMARY KEY,
        billingId VARCHAR(36) DEFAULT NULL,
        flatNumber VARCHAR(50) DEFAULT '',
        amount DECIMAL(12,2) DEFAULT 0,
        paymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        method VARCHAR(50) DEFAULT '',
        transactionId VARCHAR(100) DEFAULT '',
        receiptNo VARCHAR(100) DEFAULT '',
        status ENUM('success','failed','pending') DEFAULT 'success',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (billingId) REFERENCES billing(id) ON DELETE SET NULL,
        INDEX idx_billingId (billingId)
      )
    `);

    // Move Requests
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS move_requests (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('move_in','move_out') DEFAULT 'move_in',
        flatNumber VARCHAR(50) DEFAULT '',
        tower VARCHAR(255) DEFAULT '',
        residentName VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        moveDate DATE DEFAULT NULL,
        status ENUM('pending','approved','rejected','completed') DEFAULT 'pending',
        reason TEXT DEFAULT '',
        approvedBy VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_type (type)
      )
    `);

    // Documents
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        description TEXT DEFAULT '',
        fileUrl TEXT DEFAULT '',
        fileName VARCHAR(255) DEFAULT '',
        fileSize VARCHAR(50) DEFAULT '',
        uploadedBy VARCHAR(255) DEFAULT '',
        status ENUM('active','archived','verified','pending') DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_status (status)
      )
    `);

    // Facilities
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS facilities (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) DEFAULT '',
        capacity INT DEFAULT 0,
        status ENUM('available','maintenance','closed','booked') DEFAULT 'available',
        description TEXT DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        timings VARCHAR(255) DEFAULT '',
        charges DECIMAL(12,2) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);

    // Facility Bookings
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS facility_bookings (
        id VARCHAR(36) PRIMARY KEY,
        facilityId VARCHAR(36) DEFAULT NULL,
        facilityName VARCHAR(255) DEFAULT '',
        bookedBy VARCHAR(255) DEFAULT '',
        flatNumber VARCHAR(50) DEFAULT '',
        bookingDate DATE DEFAULT NULL,
        startTime VARCHAR(20) DEFAULT '',
        endTime VARCHAR(20) DEFAULT '',
        purpose VARCHAR(255) DEFAULT '',
        status ENUM('confirmed','cancelled','completed','pending') DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (facilityId) REFERENCES facilities(id) ON DELETE SET NULL,
        INDEX idx_facilityId (facilityId),
        INDEX idx_bookingDate (bookingDate)
      )
    `);

    // Assets
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT '',
        \`condition\` ENUM('good','fair','poor','new','damaged') DEFAULT 'good',
        value DECIMAL(12,2) DEFAULT 0,
        location VARCHAR(255) DEFAULT '',
        purchaseDate DATE DEFAULT NULL,
        warrantyExpiry DATE DEFAULT NULL,
        description TEXT DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category)
      )
    `);

    // Gate Passes
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS gate_passes (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('visitor','delivery','cab','service','other') DEFAULT 'visitor',
        name VARCHAR(255) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        flatNumber VARCHAR(50) DEFAULT '',
        purpose VARCHAR(255) DEFAULT '',
        vehicleNumber VARCHAR(50) DEFAULT '',
        status ENUM('active','used','expired','cancelled') DEFAULT 'active',
        validFrom DATETIME DEFAULT CURRENT_TIMESTAMP,
        validUntil DATETIME DEFAULT NULL,
        createdBy VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_flatNumber (flatNumber)
      )
    `);

    // Emergencies
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS emergencies (
        id VARCHAR(36) PRIMARY KEY,
        type VARCHAR(100) DEFAULT 'general',
        description TEXT DEFAULT '',
        reportedBy VARCHAR(255) DEFAULT '',
        flatNumber VARCHAR(50) DEFAULT '',
        status ENUM('active','resolved','false_alarm') DEFAULT 'active',
        resolvedAt DATETIME DEFAULT NULL,
        resolvedBy VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);

    // Announcements
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(100) DEFAULT 'general',
        priority ENUM('low','medium','high') DEFAULT 'medium',
        status ENUM('active','expired','draft') DEFAULT 'active',
        postedBy VARCHAR(255) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      )
    `);

    return dbName;
  } finally {
    await conn.end();
  }
}

// Drop society database
export async function dropSocietyDB(societyId) {
  const dbName = `society_${societyId.replace(/-/g, '_')}`;
  const conn = await getRawConnection();
  try {
    await conn.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
    // Remove from pool cache
    if (pools[dbName]) {
      await pools[dbName].end();
      delete pools[dbName];
    }
  } finally {
    await conn.end();
  }
}
