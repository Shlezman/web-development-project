const express = require('express');
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const mapToken = btoa(process.env.MAP_TOKEN)

// route for getting maps api key
router.get('/', asyncHandler(async (req, res) => {
    try {
      res.status(200).json({ 
        mapKey: mapToken 
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Failed to send back mapKey', 
        details: error.message 
      });
    }
  }));
module.exports = router;