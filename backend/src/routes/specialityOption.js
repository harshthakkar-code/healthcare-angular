const express = require('express');
const router = express.Router();
const specialityOptionController = require('../controllers/specialityOptionController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.get('/', specialityOptionController.getSpecialityOptions);
// All routes require admin authentication
router.use(auth, role('admin'));

router.post('/', specialityOptionController.createSpecialityOption);
router.put('/:id', specialityOptionController.updateSpecialityOption);
router.delete('/:id', specialityOptionController.deleteSpecialityOption);

module.exports = router; 