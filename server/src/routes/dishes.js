const express = require('express');
const Dish = require('../models/Dish');

const router = express.Router();

// GET /api/dishes - fetch all dishes
router.get('/', async (_req, res) => {
  try {
    const dishes = await Dish.find().sort({ dishId: 1 });
    res.json({ success: true, data: dishes });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch dishes' });
  }
});

// PATCH /api/dishes/:dishId/toggle - flip isPublished for one dish
router.patch('/:dishId/toggle', async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findOne({ dishId });
    if (!dish) {
      return res.status(404).json({ success: false, error: `Dish ${dishId} not found` });
    }

    dish.isPublished = !dish.isPublished;
    await dish.save();

    // The change-stream watcher (see realtime.js) broadcasts this update
    // to every connected client, including the one that made the request -
    // so the UI stays a single source of truth instead of trusting its own
    // optimistic state.
    res.json({ success: true, data: dish });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle dish' });
  }
});

module.exports = router;
