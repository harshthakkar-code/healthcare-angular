const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.post('/', auth, transactionController.createTransaction);
router.get('/', auth, transactionController.getTransactions);
router.get('/total-paid', transactionController.getTotalPaid);
router.get('/user/:userId', auth, transactionController.getTransactionsByUser);
router.get('/:id', auth, transactionController.getTransaction);
router.put('/:id', auth, transactionController.updateTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);

module.exports = router; 