const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');

// Create a new favourite
router.post('/', favouriteController.createFavourite);

// Get all favourites (with search)
router.get('/', favouriteController.getFavourites);

// Get a single favourite by ID
router.get('/:id', favouriteController.getFavouriteById);

// Update a favourite by ID
router.put('/:id', favouriteController.updateFavourite);

// Delete a favourite by ID
router.delete('/:id', favouriteController.deleteFavourite);

router.post('/status', favouriteController.getBatchFavouriteStatus);

module.exports = router; 