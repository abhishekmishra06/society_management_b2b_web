import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'society-management-secret-key';

export function setupWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      console.log('[WS] Connection without token - allowing anonymous');
      socket.user = null;
      return next();
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.log('[WS] Invalid token, allowing anonymous:', err.message);
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user?.id || 'anonymous';
    const societyId = user?.societyId;

    console.log(`[WS] Client connected: ${userId} (society: ${societyId || 'none'})`);

    // Auto-join society room if user has a societyId
    if (societyId) {
      socket.join(`society_${societyId}`);
      console.log(`[WS] ${userId} joined room: society_${societyId}`);
    }

    // Join a specific society room
    socket.on('join_society', (data) => {
      const sid = data?.societyId || data;
      if (sid) {
        socket.join(`society_${sid}`);
        console.log(`[WS] ${userId} joined room: society_${sid}`);
        socket.emit('joined_society', { societyId: sid, message: 'Joined society room' });
      }
    });

    // Leave society room
    socket.on('leave_society', (data) => {
      const sid = data?.societyId || data;
      if (sid) {
        socket.leave(`society_${sid}`);
        console.log(`[WS] ${userId} left room: society_${sid}`);
      }
    });

    // SOS trigger from client (backup path - main path is via REST API)
    socket.on('trigger_sos', (data) => {
      console.log(`[WS] SOS triggered by ${userId}:`, data);
      if (societyId) {
        io.to(`society_${societyId}`).emit('sos_alert', {
          ...data,
          reportedBy: user?.name || data.reportedBy || 'Unknown',
          societyId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // SOS resolve from client (backup path)
    socket.on('resolve_sos', (data) => {
      console.log(`[WS] SOS resolved by ${userId}:`, data);
      if (societyId) {
        io.to(`society_${societyId}`).emit('sos_resolved', {
          ...data,
          resolvedBy: user?.name || data.resolvedBy || 'Unknown',
          resolvedAt: new Date().toISOString(),
        });
      }
    });

    // General notification broadcast
    socket.on('send_notification', (data) => {
      if (societyId) {
        io.to(`society_${societyId}`).emit('notification', {
          ...data,
          from: user?.name || 'System',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Heartbeat/ping
    socket.on('ping_server', () => {
      socket.emit('pong_server', { timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WS] Client disconnected: ${userId} (${reason})`);
    });

    socket.on('error', (error) => {
      console.error(`[WS] Socket error for ${userId}:`, error.message);
    });
  });

  console.log('[WS] WebSocket server initialized');
  return io;
}
