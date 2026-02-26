import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import axios from 'axios';

// MongoDB connection
let client;
let db;
let isConnecting = false;

async function connectToMongo() {
  if (db) return db;
  
  if (isConnecting) {
    // Wait for existing connection attempt
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (db) { clearInterval(interval); resolve(); }
      }, 50);
      setTimeout(() => { clearInterval(interval); resolve(); }, 5000);
    });
    if (db) return db;
  }
  
  isConnecting = true;
  try {
    client = new MongoClient(process.env.MONGO_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db(process.env.DB_NAME || 'society_management');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    client = null;
    db = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tower-Id, X-Society-Id');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// Auth middleware (simplified)
function getAuthUser(request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  // For demo, we'll decode from localStorage on client side
  // In production, validate JWT here
  return { userId: 'admin001', role: 'SUPER_ADMIN' };
}

// Get tower and society from headers
function getContext(request) {
  return {
    towerId: request.headers.get('X-Tower-Id'),
    societyId: request.headers.get('X-Society-Id'),
  };
}

// Send SMS via Ranapay API
async function sendSMS(mobileNo, message) {
  try {
    await axios.post('https://b2buat.ranapay.in/api/send_sms', {
      mobile_no: mobileNo,
      message: message,
      template_id: '1207175354870765282',
    });
    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params;
  const route = `/${path.join('/')}`;
  const method = request.method;

  try {
    const db = await connectToMongo();
    const context = getContext(request);

    // Root endpoint
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ message: 'MyTower API v1.0' }));
    }

    // ===== AUTHENTICATION ROUTES =====
    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json();
      const { userId, password } = body;

      // Demo login - In production, verify password hash
      const users = await db.collection('users').find({}).toArray();
      let user = users.find(u => u.userId === userId && u.password === password);

      if (!user) {
        // Create demo user if not exists
        user = {
          id: uuidv4(),
          userId: userId || 'admin001',
          password: password || 'admin123',
          name: 'Admin User',
          email: 'admin@mytower.com',
          role: 'SUPER_ADMIN',
          societyId: 'society_001',
          createdAt: new Date(),
        };
        await db.collection('users').insertOne(user);
      }

      // Get towers for this society
      const towers = await db.collection('towers')
        .find({ societyId: user.societyId })
        .toArray();

      // Create some demo towers if none exist
      if (towers.length === 0) {
        const demoTowers = [
          { id: uuidv4(), name: 'Tower A', societyId: user.societyId, floors: 10, createdAt: new Date() },
          { id: uuidv4(), name: 'Tower B', societyId: user.societyId, floors: 12, createdAt: new Date() },
          { id: uuidv4(), name: 'Tower C', societyId: user.societyId, floors: 15, createdAt: new Date() },
        ];
        await db.collection('towers').insertMany(demoTowers);
        towers.push(...demoTowers);
      }

      const { password: _, _id, ...userWithoutPassword } = user;

      return handleCORS(NextResponse.json({
        token: `demo_token_${user.id}`,
        user: userWithoutPassword,
        towers: towers.map(({ _id, ...t }) => t),
        permissions: ['FULL_ACCESS'],
      }));
    }

    // ===== USER ROUTES =====
    if (route === '/user/profile' && method === 'GET') {
      const authUser = getAuthUser(request);
      const user = await db.collection('users').findOne({ userId: authUser.userId });
      const { password: _, _id, ...userWithoutPassword } = user;
      return handleCORS(NextResponse.json(userWithoutPassword));
    }

    if (route === '/user/permissions' && method === 'GET') {
      return handleCORS(NextResponse.json(['FULL_ACCESS']));
    }

    // ===== TOWER ROUTES =====
    if (route === '/towers' && method === 'GET') {
      const towers = await db.collection('towers')
        .find({ societyId: context.societyId || 'society_001' })
        .toArray();
      return handleCORS(NextResponse.json(towers.map(({ _id, ...t }) => t)));
    }

    if (route === '/towers' && method === 'POST') {
      const body = await request.json();
      const tower = {
        id: uuidv4(),
        ...body,
        societyId: context.societyId || 'society_001',
        createdAt: new Date(),
      };
      await db.collection('towers').insertOne(tower);
      const { _id, ...towerData } = tower;
      return handleCORS(NextResponse.json(towerData));
    }

    if (route.match(/^\/towers\/[^/]+$/) && method === 'GET') {
      const towerId = path[1];
      const tower = await db.collection('towers').findOne({ id: towerId });
      if (!tower) {
        return handleCORS(NextResponse.json({ error: 'Tower not found' }, { status: 404 }));
      }
      const { _id, ...towerData } = tower;
      return handleCORS(NextResponse.json(towerData));
    }

    if (route.match(/^\/towers\/[^/]+$/) && method === 'PUT') {
      const towerId = path[1];
      const body = await request.json();
      await db.collection('towers').updateOne(
        { id: towerId },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Tower updated' }));
    }

    if (route.match(/^\/towers\/[^/]+$/) && method === 'DELETE') {
      const towerId = path[1];
      await db.collection('towers').deleteOne({ id: towerId });
      return handleCORS(NextResponse.json({ message: 'Tower deleted' }));
    }

    // ===== FLAT ROUTES =====
    if (route === '/flats' && method === 'GET') {
      const query = context.towerId ? { towerId: context.towerId } : {};
      const flats = await db.collection('flats').find(query).toArray();
      return handleCORS(NextResponse.json(flats.map(({ _id, ...f }) => f)));
    }

    if (route === '/flats' && method === 'POST') {
      const body = await request.json();
      const flat = {
        id: uuidv4(),
        ...body,
        societyId: context.societyId || 'society_001',
        createdAt: new Date(),
      };
      await db.collection('flats').insertOne(flat);
      const { _id, ...flatData } = flat;
      return handleCORS(NextResponse.json(flatData));
    }

    if (route.match(/^\/flats\/[^/]+$/) && method === 'PUT') {
      const flatId = path[1];
      const body = await request.json();
      await db.collection('flats').updateOne(
        { id: flatId },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Flat updated' }));
    }

    // ===== RESIDENT ROUTES =====
    if (route === '/residents' && method === 'GET') {
      const query = context.towerId ? { tower: context.towerId } : {};
      const residents = await db.collection('residents').find(query).toArray();
      return handleCORS(NextResponse.json(residents.map(({ _id, ...r }) => r)));
    }

    if (route === '/residents' && method === 'POST') {
      const body = await request.json();
      const resident = {
        id: uuidv4(),
        ...body,
        societyId: context.societyId || 'society_001',
        status: body.status || 'active',
        createdAt: new Date(),
      };
      await db.collection('residents').insertOne(resident);
      const { _id, ...residentData } = resident;
      return handleCORS(NextResponse.json(residentData));
    }

    if (route.match(/^\/residents\/[^/]+$/) && method === 'GET') {
      const residentId = path[1];
      const resident = await db.collection('residents').findOne({ id: residentId });
      if (!resident) {
        return handleCORS(NextResponse.json({ error: 'Resident not found' }, { status: 404 }));
      }
      const { _id, ...residentData } = resident;
      return handleCORS(NextResponse.json(residentData));
    }

    if (route.match(/^\/residents\/[^/]+$/) && method === 'PUT') {
      const residentId = path[1];
      const body = await request.json();
      await db.collection('residents').updateOne(
        { id: residentId },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Resident updated' }));
    }

    if (route.match(/^\/residents\/[^/]+$/) && method === 'DELETE') {
      const residentId = path[1];
      await db.collection('residents').deleteOne({ id: residentId });
      return handleCORS(NextResponse.json({ message: 'Resident deleted' }));
    }

    if (route.match(/^\/residents\/[^/]+\/deactivate$/) && method === 'POST') {
      const residentId = path[1];
      await db.collection('residents').updateOne(
        { id: residentId },
        { $set: { status: 'inactive', deactivatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Resident deactivated' }));
    }

    // ===== OWNER ROUTES =====
    if (route === '/owners' && method === 'GET') {
      const owners = await db.collection('residents')
        .find({ type: 'owner', ...(context.towerId && { tower: context.towerId }) })
        .toArray();
      return handleCORS(NextResponse.json(owners.map(({ _id, ...o }) => o)));
    }

    if (route === '/owners' && method === 'POST') {
      const body = await request.json();
      const owner = {
        id: uuidv4(),
        ...body,
        type: 'owner',
        societyId: context.societyId || 'society_001',
        status: 'active',
        createdAt: new Date(),
      };
      await db.collection('residents').insertOne(owner);
      const { _id, ...ownerData } = owner;
      return handleCORS(NextResponse.json(ownerData));
    }

    // ===== TENANT ROUTES =====
    if (route === '/tenants' && method === 'GET') {
      const tenants = await db.collection('residents')
        .find({ type: 'tenant', ...(context.towerId && { tower: context.towerId }) })
        .toArray();
      return handleCORS(NextResponse.json(tenants.map(({ _id, ...t }) => t)));
    }

    if (route === '/tenants' && method === 'POST') {
      const body = await request.json();
      const tenant = {
        id: uuidv4(),
        ...body,
        type: 'tenant',
        societyId: context.societyId || 'society_001',
        status: 'active',
        createdAt: new Date(),
      };
      await db.collection('residents').insertOne(tenant);
      const { _id, ...tenantData } = tenant;
      return handleCORS(NextResponse.json(tenantData));
    }

    // ===== FAMILY MEMBER ROUTES =====
    if (route.match(/^\/residents\/[^/]+\/family$/) && method === 'GET') {
      const residentId = path[1];
      const familyMembers = await db.collection('family_members')
        .find({ residentId })
        .toArray();
      return handleCORS(NextResponse.json(familyMembers.map(({ _id, ...f }) => f)));
    }

    if (route.match(/^\/residents\/[^/]+\/family$/) && method === 'POST') {
      const residentId = path[1];
      const body = await request.json();
      const familyMember = {
        id: uuidv4(),
        residentId,
        ...body,
        createdAt: new Date(),
      };
      await db.collection('family_members').insertOne(familyMember);
      const { _id, ...familyData } = familyMember;
      return handleCORS(NextResponse.json(familyData));
    }

    // ===== VEHICLE ROUTES =====
    if (route === '/vehicles' && method === 'GET') {
      const query = context.towerId ? { tower: context.towerId } : {};
      const vehicles = await db.collection('vehicles').find(query).toArray();
      return handleCORS(NextResponse.json(vehicles.map(({ _id, ...v }) => v)));
    }

    if (route === '/vehicles' && method === 'POST') {
      const body = await request.json();
      const vehicle = {
        id: uuidv4(),
        ...body,
        societyId: context.societyId || 'society_001',
        createdAt: new Date(),
      };
      await db.collection('vehicles').insertOne(vehicle);
      const { _id, ...vehicleData } = vehicle;
      return handleCORS(NextResponse.json(vehicleData));
    }

    if (route.match(/^\/vehicles\/[^/]+$/) && method === 'PUT') {
      const vehicleId = path[1];
      const body = await request.json();
      await db.collection('vehicles').updateOne(
        { id: vehicleId },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Vehicle updated' }));
    }

    if (route.match(/^\/vehicles\/[^/]+$/) && method === 'DELETE') {
      const vehicleId = path[1];
      await db.collection('vehicles').deleteOne({ id: vehicleId });
      return handleCORS(NextResponse.json({ message: 'Vehicle deleted' }));
    }

    // ===== KYC ROUTES =====
    if (route === '/kyc' && method === 'GET') {
      const kycRequests = await db.collection('kyc_requests').find({}).toArray();
      return handleCORS(NextResponse.json(kycRequests.map(({ _id, ...k }) => k)));
    }

    if (route === '/kyc' && method === 'POST') {
      const body = await request.json();
      const kycRequest = {
        id: uuidv4(),
        ...body,
        status: 'pending',
        submittedAt: new Date(),
      };
      await db.collection('kyc_requests').insertOne(kycRequest);
      const { _id, ...kycData } = kycRequest;
      return handleCORS(NextResponse.json(kycData));
    }

    if (route.match(/^\/kyc\/[^/]+\/approve$/) && method === 'POST') {
      const kycId = path[1];
      const body = await request.json();
      await db.collection('kyc_requests').updateOne(
        { id: kycId },
        { $set: { status: 'approved', remarks: body.remarks, approvedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'KYC approved' }));
    }

    if (route.match(/^\/kyc\/[^/]+\/reject$/) && method === 'POST') {
      const kycId = path[1];
      const body = await request.json();
      await db.collection('kyc_requests').updateOne(
        { id: kycId },
        { $set: { status: 'rejected', remarks: body.remarks, rejectedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'KYC rejected' }));
    }

    // ===== EMERGENCY ROUTES =====
    if (route === '/emergency/trigger' && method === 'POST') {
      const body = await request.json();
      const emergency = {
        id: uuidv4(),
        ...body,
        status: 'active',
        timestamp: new Date(),
        societyId: context.societyId || 'society_001',
      };
      await db.collection('emergencies').insertOne(emergency);
      
      // Note: Socket.io broadcast would happen here in real implementation
      // For now, we'll just store it in the database
      
      const { _id, ...emergencyData } = emergency;
      return handleCORS(NextResponse.json(emergencyData));
    }

    if (route === '/emergency/active' && method === 'GET') {
      const emergencies = await db.collection('emergencies')
        .find({ status: 'active' })
        .toArray();
      return handleCORS(NextResponse.json(emergencies.map(({ _id, ...e }) => e)));
    }

    if (route.match(/^\/emergency\/[^/]+\/resolve$/) && method === 'POST') {
      const emergencyId = path[1];
      await db.collection('emergencies').updateOne(
        { id: emergencyId },
        { $set: { status: 'resolved', resolvedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Emergency resolved' }));
    }

    // ===== SMS ROUTES =====
    if (route === '/sms/send' && method === 'POST') {
      const body = await request.json();
      const { mobile, message } = body;
      const result = await sendSMS(mobile, message);
      return handleCORS(NextResponse.json(result));
    }

    // ===== BILLING ROUTES =====
    // Maintenance Bills
    if (route === '/billing/maintenance' && method === 'GET') {
      const bills = await db.collection('maintenance_bills').find({}).toArray();
      return handleCORS(NextResponse.json(bills.map(({ _id, ...b }) => b)));
    }

    if (route === '/billing/maintenance' && method === 'POST') {
      const body = await request.json();
      const bill = {
        id: uuidv4(),
        ...body,
        status: body.status || 'pending',
        generatedAt: new Date(),
      };
      await db.collection('maintenance_bills').insertOne(bill);
      const { _id, ...billData } = bill;
      return handleCORS(NextResponse.json(billData));
    }

    // Utility Bills
    if (route === '/billing/utility' && method === 'GET') {
      const bills = await db.collection('utility_bills').find({}).toArray();
      return handleCORS(NextResponse.json(bills.map(({ _id, ...b }) => b)));
    }

    if (route === '/billing/utility' && method === 'POST') {
      const body = await request.json();
      const bill = {
        id: uuidv4(),
        ...body,
        status: 'pending',
        createdAt: new Date(),
      };
      await db.collection('utility_bills').insertOne(bill);
      const { _id, ...billData } = bill;
      return handleCORS(NextResponse.json(billData));
    }

    // Payments
    if (route === '/billing/payments' && method === 'GET') {
      const payments = await db.collection('payments').find({}).toArray();
      return handleCORS(NextResponse.json(payments.map(({ _id, ...p }) => p)));
    }

    if (route === '/billing/payments' && method === 'POST') {
      const body = await request.json();
      const payment = {
        id: uuidv4(),
        ...body,
        status: 'completed',
        paymentDate: new Date(),
      };
      await db.collection('payments').insertOne(payment);
      
      // Update bill status
      if (body.billId) {
        await db.collection('maintenance_bills').updateOne(
          { id: body.billId },
          { $set: { status: 'paid', paidAt: new Date() } }
        );
      }
      
      const { _id, ...paymentData } = payment;
      return handleCORS(NextResponse.json(paymentData));
    }

    // Expenses
    if (route === '/billing/expenses' && method === 'GET') {
      const expenses = await db.collection('expenses').find({}).toArray();
      return handleCORS(NextResponse.json(expenses.map(({ _id, ...e }) => e)));
    }

    if (route === '/billing/expenses' && method === 'POST') {
      const body = await request.json();
      const expense = {
        id: uuidv4(),
        ...body,
        createdAt: new Date(),
      };
      await db.collection('expenses').insertOne(expense);
      const { _id, ...expenseData } = expense;
      return handleCORS(NextResponse.json(expenseData));
    }

    // Ledger
    if (route === '/billing/ledger' && method === 'GET') {
      const ledger = await db.collection('ledger').find({}).sort({ date: -1 }).toArray();
      return handleCORS(NextResponse.json(ledger.map(({ _id, ...l }) => l)));
    }

    if (route === '/billing/ledger' && method === 'POST') {
      const body = await request.json();
      const entry = {
        id: uuidv4(),
        ...body,
        date: body.date || new Date(),
        createdAt: new Date(),
      };
      await db.collection('ledger').insertOne(entry);
      const { _id, ...entryData } = entry;
      return handleCORS(NextResponse.json(entryData));
    }

    // ===== VISITOR ROUTES =====
    if (route === '/visitors' && method === 'GET') {
      const visitors = await db.collection('visitors').find({}).sort({ entryTime: -1 }).toArray();
      return handleCORS(NextResponse.json(visitors.map(({ _id, ...v }) => v)));
    }

    if (route === '/visitors' && method === 'POST') {
      const body = await request.json();
      const visitor = {
        id: uuidv4(),
        ...body,
        status: body.status || 'pending',
        entryTime: new Date(),
      };
      await db.collection('visitors').insertOne(visitor);
      const { _id, ...visitorData } = visitor;
      return handleCORS(NextResponse.json(visitorData));
    }

    if (route.match(/^\/visitors\/[^/]+\/approve$/) && method === 'POST') {
      const visitorId = path[1];
      await db.collection('visitors').updateOne(
        { id: visitorId },
        { $set: { status: 'approved', approvedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Visitor approved' }));
    }

    if (route.match(/^\/visitors\/[^/]+\/exit$/) && method === 'POST') {
      const visitorId = path[1];
      await db.collection('visitors').updateOne(
        { id: visitorId },
        { $set: { status: 'exited', exitTime: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Visitor exit recorded' }));
    }

    // Gate Pass
    if (route === '/gate-pass' && method === 'GET') {
      const passes = await db.collection('gate_passes').find({}).toArray();
      return handleCORS(NextResponse.json(passes.map(({ _id, ...p }) => p)));
    }

    if (route === '/gate-pass' && method === 'POST') {
      const body = await request.json();
      const pass = {
        id: uuidv4(),
        ...body,
        qrCode: `QR-${uuidv4()}`,
        status: 'active',
        createdAt: new Date(),
      };
      await db.collection('gate_passes').insertOne(pass);
      const { _id, ...passData } = pass;
      return handleCORS(NextResponse.json(passData));
    }

    // Blacklist
    if (route === '/blacklist' && method === 'GET') {
      const blacklist = await db.collection('blacklist').find({}).toArray();
      return handleCORS(NextResponse.json(blacklist.map(({ _id, ...b }) => b)));
    }

    if (route === '/blacklist' && method === 'POST') {
      const body = await request.json();
      const entry = {
        id: uuidv4(),
        ...body,
        addedAt: new Date(),
      };
      await db.collection('blacklist').insertOne(entry);
      const { _id, ...entryData } = entry;
      return handleCORS(NextResponse.json(entryData));
    }

    // ===== STAFF ROUTES =====
    if (route === '/staff' && method === 'GET') {
      const staff = await db.collection('staff').find({}).toArray();
      return handleCORS(NextResponse.json(staff.map(({ _id, ...s }) => s)));
    }

    if (route === '/staff' && method === 'POST') {
      const body = await request.json();
      const staffMember = {
        id: uuidv4(),
        ...body,
        status: 'active',
        joinedAt: new Date(),
      };
      await db.collection('staff').insertOne(staffMember);
      const { _id, ...staffData } = staffMember;
      return handleCORS(NextResponse.json(staffData));
    }

    // Staff Attendance
    if (route === '/staff/attendance' && method === 'GET') {
      const attendance = await db.collection('staff_attendance').find({}).sort({ date: -1 }).toArray();
      return handleCORS(NextResponse.json(attendance.map(({ _id, ...a }) => a)));
    }

    if (route === '/staff/attendance' && method === 'POST') {
      const body = await request.json();
      const record = {
        id: uuidv4(),
        ...body,
        date: body.date || new Date(),
        createdAt: new Date(),
      };
      await db.collection('staff_attendance').insertOne(record);
      const { _id, ...recordData } = record;
      return handleCORS(NextResponse.json(recordData));
    }

    // Staff Salary
    if (route === '/staff/salary' && method === 'GET') {
      const salaries = await db.collection('staff_salary').find({}).toArray();
      return handleCORS(NextResponse.json(salaries.map(({ _id, ...s }) => s)));
    }

    if (route === '/staff/salary' && method === 'POST') {
      const body = await request.json();
      const salary = {
        id: uuidv4(),
        ...body,
        generatedAt: new Date(),
      };
      await db.collection('staff_salary').insertOne(salary);
      const { _id, ...salaryData } = salary;
      return handleCORS(NextResponse.json(salaryData));
    }

    // ===== VENDOR ROUTES =====
    if (route === '/vendors' && method === 'GET') {
      const vendors = await db.collection('vendors').find({}).toArray();
      return handleCORS(NextResponse.json(vendors.map(({ _id, ...v }) => v)));
    }

    if (route === '/vendors' && method === 'POST') {
      const body = await request.json();
      const vendor = {
        id: uuidv4(),
        ...body,
        status: 'active',
        createdAt: new Date(),
      };
      await db.collection('vendors').insertOne(vendor);
      const { _id, ...vendorData } = vendor;
      return handleCORS(NextResponse.json(vendorData));
    }

    // Vendor Contracts
    if (route === '/vendors/contracts' && method === 'GET') {
      const contracts = await db.collection('vendor_contracts').find({}).toArray();
      return handleCORS(NextResponse.json(contracts.map(({ _id, ...c }) => c)));
    }

    if (route === '/vendors/contracts' && method === 'POST') {
      const body = await request.json();
      const contract = {
        id: uuidv4(),
        ...body,
        status: 'active',
        createdAt: new Date(),
      };
      await db.collection('vendor_contracts').insertOne(contract);
      const { _id, ...contractData } = contract;
      return handleCORS(NextResponse.json(contractData));
    }

    // Vendor Payments
    if (route === '/vendors/payments' && method === 'GET') {
      const payments = await db.collection('vendor_payments').find({}).toArray();
      return handleCORS(NextResponse.json(payments.map(({ _id, ...p }) => p)));
    }

    if (route === '/vendors/payments' && method === 'POST') {
      const body = await request.json();
      const payment = {
        id: uuidv4(),
        ...body,
        status: 'completed',
        paymentDate: new Date(),
      };
      await db.collection('vendor_payments').insertOne(payment);
      const { _id, ...paymentData } = payment;
      return handleCORS(NextResponse.json(paymentData));
    }

    // ===== NOTICE & COMMUNICATION ROUTES =====
    if (route === '/notices' && method === 'GET') {
      const notices = await db.collection('notices').find({}).sort({ createdAt: -1 }).toArray();
      return handleCORS(NextResponse.json(notices.map(({ _id, ...n }) => n)));
    }

    if (route === '/notices' && method === 'POST') {
      const body = await request.json();
      const notice = {
        id: uuidv4(),
        ...body,
        createdAt: new Date(),
      };
      await db.collection('notices').insertOne(notice);
      const { _id, ...noticeData } = notice;
      return handleCORS(NextResponse.json(noticeData));
    }

    // Announcements
    if (route === '/announcements' && method === 'GET') {
      const announcements = await db.collection('announcements').find({}).sort({ createdAt: -1 }).toArray();
      return handleCORS(NextResponse.json(announcements.map(({ _id, ...a }) => a)));
    }

    if (route === '/announcements' && method === 'POST') {
      const body = await request.json();
      const announcement = {
        id: uuidv4(),
        ...body,
        createdAt: new Date(),
      };
      await db.collection('announcements').insertOne(announcement);
      const { _id, ...announcementData } = announcement;
      return handleCORS(NextResponse.json(announcementData));
    }

    // ===== COMPLAINT ROUTES =====
    if (route === '/complaints' && method === 'GET') {
      const complaints = await db.collection('complaints').find({}).sort({ createdAt: -1 }).toArray();
      return handleCORS(NextResponse.json(complaints.map(({ _id, ...c }) => c)));
    }

    if (route === '/complaints' && method === 'POST') {
      const body = await request.json();
      const complaint = {
        id: uuidv4(),
        ...body,
        status: 'open',
        createdAt: new Date(),
      };
      await db.collection('complaints').insertOne(complaint);
      const { _id, ...complaintData } = complaint;
      return handleCORS(NextResponse.json(complaintData));
    }

    if (route.match(/^\/complaints\/[^/]+$/) && method === 'PUT') {
      const complaintId = path[1];
      const body = await request.json();
      await db.collection('complaints').updateOne(
        { id: complaintId },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Complaint updated' }));
    }

    // ===== FACILITY ROUTES =====
    if (route === '/facilities' && method === 'GET') {
      const facilities = await db.collection('facilities').find({}).toArray();
      return handleCORS(NextResponse.json(facilities.map(({ _id, ...f }) => f)));
    }

    if (route === '/facilities' && method === 'POST') {
      const body = await request.json();
      const facility = {
        id: uuidv4(),
        ...body,
        status: 'available',
        createdAt: new Date(),
      };
      await db.collection('facilities').insertOne(facility);
      const { _id, ...facilityData } = facility;
      return handleCORS(NextResponse.json(facilityData));
    }

    // Facility Bookings
    if (route === '/facilities/bookings' && method === 'GET') {
      const bookings = await db.collection('facility_bookings').find({}).sort({ bookingDate: -1 }).toArray();
      return handleCORS(NextResponse.json(bookings.map(({ _id, ...b }) => b)));
    }

    if (route === '/facilities/bookings' && method === 'POST') {
      const body = await request.json();
      const booking = {
        id: uuidv4(),
        ...body,
        status: 'confirmed',
        bookedAt: new Date(),
      };
      await db.collection('facility_bookings').insertOne(booking);
      const { _id, ...bookingData } = booking;
      return handleCORS(NextResponse.json(bookingData));
    }

    // Assets
    if (route === '/assets' && method === 'GET') {
      const assets = await db.collection('assets').find({}).toArray();
      return handleCORS(NextResponse.json(assets.map(({ _id, ...a }) => a)));
    }

    if (route === '/assets' && method === 'POST') {
      const body = await request.json();
      const asset = {
        id: uuidv4(),
        ...body,
        purchasedAt: new Date(),
      };
      await db.collection('assets').insertOne(asset);
      const { _id, ...assetData } = asset;
      return handleCORS(NextResponse.json(assetData));
    }

    // AMC
    if (route === '/amc' && method === 'GET') {
      const amc = await db.collection('amc').find({}).toArray();
      return handleCORS(NextResponse.json(amc.map(({ _id, ...a }) => a)));
    }

    if (route === '/amc' && method === 'POST') {
      const body = await request.json();
      const amcEntry = {
        id: uuidv4(),
        ...body,
        status: 'active',
        createdAt: new Date(),
      };
      await db.collection('amc').insertOne(amcEntry);
      const { _id, ...amcData } = amcEntry;
      return handleCORS(NextResponse.json(amcData));
    }

    // ===== PARKING ROUTES =====
    if (route === '/parking' && method === 'GET') {
      const parkingSlots = await db.collection('parking_slots').find({}).toArray();
      return handleCORS(NextResponse.json(parkingSlots.map(({ _id, ...p }) => p)));
    }

    if (route === '/parking' && method === 'POST') {
      const body = await request.json();
      const slot = {
        id: uuidv4(),
        ...body,
        status: body.status || 'available',
        createdAt: new Date(),
      };
      await db.collection('parking_slots').insertOne(slot);
      const { _id, ...slotData } = slot;
      return handleCORS(NextResponse.json(slotData));
    }

    if (route.match(/^\/parking\/[^/]+$/) && method === 'PUT') {
      const id = route.split('/')[2];
      const body = await request.json();
      await db.collection('parking_slots').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Parking slot updated', id }));
    }

    if (route.match(/^\/parking\/[^/]+$/) && method === 'DELETE') {
      const id = route.split('/')[2];
      await db.collection('parking_slots').deleteOne({ id });
      return handleCORS(NextResponse.json({ message: 'Parking slot deleted', id }));
    }

    // Move Requests
    if (route === '/move' && method === 'GET') {
      const moveRequests = await db.collection('move_requests').find({}).sort({ requestDate: -1 }).toArray();
      return handleCORS(NextResponse.json(moveRequests.map(({ _id, ...m }) => m)));
    }

    if (route === '/move' && method === 'POST') {
      const body = await request.json();
      const moveRequest = {
        id: uuidv4(),
        ...body,
        status: body.status || 'pending',
        requestDate: new Date(),
      };
      await db.collection('move_requests').insertOne(moveRequest);
      const { _id, ...moveData } = moveRequest;
      return handleCORS(NextResponse.json(moveData));
    }

    if (route.match(/^\/move\/[^/]+$/) && method === 'PUT') {
      const id = route.split('/')[2];
      const body = await request.json();
      await db.collection('move_requests').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return handleCORS(NextResponse.json({ message: 'Move request updated', id }));
    }

    if (route.match(/^\/move\/[^/]+$/) && method === 'DELETE') {
      const id = route.split('/')[2];
      await db.collection('move_requests').deleteOne({ id });
      return handleCORS(NextResponse.json({ message: 'Move request deleted', id }));
    }

    // Documents
    if (route === '/documents' && method === 'GET') {
      const documents = await db.collection('documents').find({}).toArray();
      return handleCORS(NextResponse.json(documents.map(({ _id, ...d }) => d)));
    }

    if (route === '/documents' && method === 'POST') {
      const body = await request.json();
      const document = {
        id: uuidv4(),
        ...body,
        uploadedAt: new Date(),
      };
      await db.collection('documents').insertOne(document);
      const { _id, ...documentData } = document;
      return handleCORS(NextResponse.json(documentData));
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ));

  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    ));
  }
}

// Export all HTTP methods
export const GET = handleRoute;
export const POST = handleRoute;
export const PUT = handleRoute;
export const DELETE = handleRoute;
export const PATCH = handleRoute;
