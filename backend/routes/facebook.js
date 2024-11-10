const express = require('express');
const axios = require("axios");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
// Posting new post on the facebook page using facebook api 
async function fbPost(post) {
  const url = `https://graph.facebook.com/v21.0/${process.env.FACEBOOK_PAGE_ID}/feed`;
  
  const params = {
    access_token: process.env.FACEBOOK_ACCESS_TOKEN,
    message: post
  };

  try {
    const response = await axios.post(url, null, { params });
    console.log('Facebook post created successfully:', response.data);
  } catch (error) {
    console.error('Error posting to Facebook:', error.response ? error.response.data : error.message);
  }
}

// route for triggering new greeting post
router.post('/', asyncHandler(async (req, res) => {
    try {
      const { fb } = req.body;
  
      const response = await fbPost(fb);
      res.status(200).json({ 
        message: 'Facebook post posted successfully'
      });
  
    } catch (error) {
      console.error('posting error:', error);
      res.status(500).json({ 
        error: 'Failed to post on facebook page', 
        details: error.message 
      });
    }
  }));
module.exports = router;
