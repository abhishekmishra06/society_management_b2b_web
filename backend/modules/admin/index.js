import { Router } from 'express';
import statsRoutes from './stats.routes.js';
import societiesRoutes from './societies.routes.js';
import towersRoutes from './towers.routes.js';
import flatsRoutes from './flats.routes.js';
import usersRoutes from './users.routes.js';
import teamsRoutes from './teams.routes.js';

const router = Router();

// Mount sub-routes
router.use('/stats', statsRoutes);
router.use('/societies', societiesRoutes);

// Tower/Flat routes are nested under /societies/:id
router.use('/societies', towersRoutes);
router.use('/societies', flatsRoutes);

router.use('/users', usersRoutes);
router.use('/teams', teamsRoutes);

export default router;
