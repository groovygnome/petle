import express from 'express';
const router = express.Router();

import controller from '../controllers/DailiesController.js';

router.get('/dailies/:date', controller.getDaily);
router.delete('/dailies/delete', controller.deleteDailies);
router.post('/dailies/:date/:answer', controller.newDaily);

export default router;
