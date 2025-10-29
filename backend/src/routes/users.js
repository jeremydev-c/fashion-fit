const express = require('express');
const router = express.Router();

// User profile routes
router.get('/profile', (req, res) => {
  res.json({ message: 'Get user profile - to be implemented' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update user profile - to be implemented' });
});

module.exports = router;
