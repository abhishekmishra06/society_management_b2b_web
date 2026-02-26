import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import axios from 'axios';

// MongoDB connection
let client;
let db;

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    db = client.db(process.env.DB_NAME || 'society_management');
  }
  return db;
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
