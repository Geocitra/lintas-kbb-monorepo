// apps/api/src/routes/spatialRoutes.ts
import { Router } from 'express';
import { SpatialController } from '../controllers/SpatialController';

const router = Router();

// Endpoint Publik: Diambil oleh React Leaflet (Batas Administrasi Desa)
// GET /api/v1/spatial/boundaries?zoom=15
router.get('/boundaries', SpatialController.getBoundaries);

export default router;