const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  resolveItem
} = require('../controllers/itemController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(getItems)
  .post(protect, upload.array('images', 5), createItem);

router
  .route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

router.put('/:id/resolve', protect, resolveItem);

module.exports = router;