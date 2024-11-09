const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

// twitter auth
const appKey = process.env.X_APP_KEY;
const appSecret = process.env.X_APP_SECRET;
const accessToken = process.env.X_ACCESS_TOKEN;
const accessTokenSecret = process.env.X_TOKEN_SECRET;

oauth = new OAuth({
  consumer: {
    key: appKey,
    secret: appSecret
  },
  signature_method: 'HMAC-SHA1',
  hash_function: (baseString, key) => {
    return crypto
      .createHmac('sha1', key)
      .update(baseString)
      .digest('base64');
  }
});

async function postTweet(post) {
  try {
    const endpoint = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    
    // Request data
    const data = {
      text: post
    };

    // Generate OAuth parameters
    const oauthSignature = oauth.authorize(
      {
        url: endpoint,
        method: method,
        data: data
      },
      {
        key: accessToken,
        secret: accessTokenSecret
      }
    );

    // Get authorization header
    const authHeader = oauth.toHeader(oauthSignature);

    // Make the request with OAuth headers
    const response = await axios({
      url: endpoint,
      method: method,
      data: data,
      headers: {
        ...authHeader,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error posting tweet:', error.response?.data || error.message);
    throw error;
  }
}




router.post('/', asyncHandler(async (req, res) => {
    try {
      const { tweet } = req.body;
  
      // Validate tweet length
      if (!tweet || tweet.length > 280) {
        return res.status(400).json({ 
          error: 'Tweet must be between 1 and 280 characters' 
        });
      }
  
      const response = await postTweet(tweet);
  
      res.status(200).json({ 
        message: 'Tweet posted successfully', 
        tweetId: response.data.id 
      });
  
    } catch (error) {
      console.error('Tweet posting error:', error);
      res.status(500).json({ 
        error: 'Failed to post tweet', 
        details: error.message 
      });
    }
  }));
module.exports = router;
