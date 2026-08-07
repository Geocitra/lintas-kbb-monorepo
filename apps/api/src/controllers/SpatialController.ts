import { Request, Response, NextFunction } from 'express';
import { SpatialService } from '../services/SpatialService';

const spatialService = new SpatialService();

export class SpatialController {
    static async getBoundaries(req: Request, res: Response, next: NextFunction) {
        try {
            const zoom = parseInt(req.query.zoom as string) || 12;

            // HANYA 1 BARIS INI! Logika Toleransi Zoom ada di Service.
            const geojson = await spatialService.getSimplifiedBoundaries(zoom);

            res.status(200).json(geojson);
        } catch (error) { next(error); }
    }
}