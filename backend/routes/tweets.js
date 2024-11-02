const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

// twitter auth
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({ //token: AAAAAAAAAAAAAAAAAAAAALCywgEAAAAAo8ck6DcSEPK9gYxsO5V%2BYsCKARA%3DGawYI0g1gWkqo8d0FfCb4F7qNwXrWxckP3igTn7mH0jS36yDib
  appKey: "BP68Sfnuv52Hpb4BJZzfGvN6j",
  appSecret: "JWgymqDBRfsfhZTk8IsvR0ww2HijJkIQuaf2OJeBs2lA5Oh4Aj",
  accessToken: "1851239489143705600-RklI6NyVvGaRYjs0a5gk3t1bU6LoR3",
  accessSecret: "xLAyArYltkv51HHx3eKLRC7gpInkOjmM79c7XnnIrWD3X"
});


// Tweet Endpoint
router.post('/', [auth], asyncHandler(async (req, res) => {
    try {
      const { tweet } = req.body;
  
      // Validate tweet length (Twitter's max is 500 characters)
      if (!tweet || tweet.length > 500) {
        return res.status(400).json({ 
          error: 'Tweet must be between 1 and 500 characters' 
        });
      }
  
      // Post the tweet
      const response = await twitterClient.v2.tweet(tweet);
  
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
module.exports = router;