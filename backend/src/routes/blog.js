const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const upload = require('../middlewares/upload');

router.post('/', auth, role('admin'), upload.single('image'), blogController.createBlog);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlog);
router.put('/:id', auth, role('admin'), upload.single('image'), blogController.updateBlog);
router.delete('/:id', auth, role('admin'), blogController.deleteBlog);

module.exports = router; 