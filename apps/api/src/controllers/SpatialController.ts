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

    static async getViewport(req: Request, res: Response, next: NextFunction) {
        try {
            const minLat = parseFloat(req.query.minLat as string);
            const minLng = parseFloat(req.query.minLng as string);
            const maxLat = parseFloat(req.query.maxLat as string);
            const maxLng = parseFloat(req.query.maxLng as string);
            const zoom   = parseFloat(req.query.zoom   as string) || 12;

            if (isNaN(minLat) || isNaN(minLng) || isNaN(maxLat) || isNaN(maxLng)) {
                res.status(400).json({ success: false, message: 'Parameter bounds tidak valid.' });
                return;
            }

            const assets = await spatialService.getAssetsInViewport(minLat, minLng, maxLat, maxLng, zoom);
            res.status(200).json({ success: true, data: assets });
        } catch (error) { next(error); }
    }
}