"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const conversation_service_1 = require("../services/conversation.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
const validateRequest = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach((error) => {
            if (error.type === 'field') {
                const field = error.path;
                if (!details[field]) {
                    details[field] = [];
                }
                details[field].push(error.msg);
            }
        });
        throw new error_middleware_1.AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
    }
    next();
};
const createConversationValidation = [
    (0, express_validator_1.body)('clientId').isMongoId().withMessage('Invalid client ID'),
    (0, express_validator_1.body)('type')
        .isIn(['text', 'audio', 'image', 'video'])
        .withMessage('Type must be text, audio, image, or video'),
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('summary')
        .trim()
        .notEmpty()
        .withMessage('Summary is required')
        .isLength({ max: 2000 })
        .withMessage('Summary cannot exceed 2000 characters'),
    (0, express_validator_1.body)('nextFollowUpDate')
        .optional({ values: 'null' })
        .isISO8601()
        .withMessage('Invalid date format'),
];
// GET /api/conversations/:clientId - Get all conversations for a client
router.get('/:clientId', (0, express_validator_1.param)('clientId').isMongoId().withMessage('Invalid client ID'), validateRequest, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const conversations = await conversation_service_1.conversationService.getConversations(userId, req.params.clientId);
        res.json({
            success: true,
            data: conversations,
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/conversations - Create new conversation
router.post('/', createConversationValidation, validateRequest, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const conversation = await conversation_service_1.conversationService.createConversation(userId, req.body);
        res.status(201).json({
            success: true,
            data: conversation,
        });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid conversation ID'), validateRequest, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await conversation_service_1.conversationService.deleteConversation(userId, req.params.id);
        res.json({
            success: true,
            message: 'Conversation deleted',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=conversation.routes.js.map