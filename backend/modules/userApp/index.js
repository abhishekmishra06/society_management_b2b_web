import { Router } from 'express';
import profileRoutes from './profile.routes.js';
import myComplaintsRoutes from './myComplaints.routes.js';
import myVisitorsRoutes from './myVisitors.routes.js';
import myBillsRoutes from './myBills.routes.js';
import myNoticesRoutes from './myNotices.routes.js';
import myBookingsRoutes from './myBookings.routes.js';
import sosRoutes from './sos.routes.js';
import myDashboardRoutes from './myDashboard.routes.js';

const router = Router();

// Mount user app sub-routes
router.use('/', profileRoutes);
router.use('/my-dashboard', myDashboardRoutes);
router.use('/my-complaints', myComplaintsRoutes);
router.use('/my-visitors', myVisitorsRoutes);
router.use('/my-bills', myBillsRoutes);
router.use('/my-notices', myNoticesRoutes);
router.use('/my-bookings', myBookingsRoutes);
router.use('/sos', sosRoutes);

export default router;
