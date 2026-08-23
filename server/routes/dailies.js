import express from 'express';
const router = express.Router();

import controller from '../controllers/DailiesController.js';

router.get('/:db/:date', controller.getDaily);
router.delete('/:db/delete', controller.deleteDailies);
router.post('/:db/:date/:answer', controller.newDaily);

export default router;
