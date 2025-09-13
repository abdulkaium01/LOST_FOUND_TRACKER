const express = require('express');
const { getItems, getItem, createItem, updateItem, deleteItem, resolveItem } = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/imageUpload');
const router = express.Router();

router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

router.route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);
  
router.route('/:id/resolve')
  .put(protect, resolveItem);

module.exports = router;