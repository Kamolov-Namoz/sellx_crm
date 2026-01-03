import { Router, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { conversationService } from '../services/conversation.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

router.use(authMiddleware);

const validateRequest = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(error.msg);
      }
    });
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
  }
  next();
};

const createConversationValidation = [
  body('clientId').isMongoId().withMessage('Invalid client ID'),
  body('type')
    .isIn(['text', 'audio', 'image', 'video'])
    .withMessage('Type must be text, audio, image, or video'),
  body('content').notEmpty().withMessage('Content is required'),
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Summary is required')
    .isLength({ max: 2000 })
    .withMessage('Summary cannot exceed 2000 characters'),
  body('nextFollowUpDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Invalid date format'),
];

// GET /api/conversations/:clientId - Get all conversations for a client
router.get(
  '/:clientId',
  param('clientId').isMongoId().withMessage('Invalid client ID'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const conversations = await conversationService.getConversations(
        userId,
        req.params.clientId
      );

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/conversations - Create new conversation
router.post(
  '/',
  createConversationValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const conversation = await conversationService.createConversation(userId, req.body);

      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/conversations/:id - Delete conversation
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid conversation ID'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      await conversationService.deleteConversation(userId, req.params.id);

      res.json({
        success: true,
        message: 'Conversation deleted',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
