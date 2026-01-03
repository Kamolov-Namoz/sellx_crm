import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload, getFileUrl } from '../services/upload.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware);

/**
 * POST /api/upload
 * Upload a file (image, audio, video)
 */
router.post(
  '/',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'Fayl yuklanmadi' },
        });
        return;
      }

      const fileUrl = getFileUrl(req.file.filename);

      res.json({
        success: true,
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
