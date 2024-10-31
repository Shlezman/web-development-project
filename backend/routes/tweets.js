const express = require('express');
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

// twitter auth
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: atob("RmxWdTNCclJ5WmkyTUtnM3RCRjdZUmN1cg=="),
  appSecret: atob("WEZMaUlzdWJqTjczYmpTVjdjTXhZdEpLRTVycjRUdWhjQUNtQ1hKZmNOeDgzbG1UMmU="),
  accessToken: atob("MTg1MTIzOTQ4OTE0MzcwNTYwMC1KV0dCNkkwVkswZk5OZXJWQ1RxamhEb3NrVXJjY0U="),
  accessSecret: atob("ajVFdWxYeGdja3dJWXNoSjlWNjE0NENTMjIzZEkxOEdrbW9LWnQ0SWl5QmMz")
});


// Tweet Endpoint
router.post('/api/tweet', asyncHandler(async (req, res) => {
    try {
      const { tweet } = req.body;
  
      // Validate tweet length (Twitter's max is 500 characters)
      if (!tweet || tweet.length > 500) {
        return res.status(400).json({ 
          error: 'Tweet must be between 1 and 500 characters' 
        });
      }
  
      // Post the tweet
      const response = await client.v2.tweet(tweet);
  
      // Send successful response
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