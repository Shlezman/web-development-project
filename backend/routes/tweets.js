//token: AAAAAAAAAAAAAAAAAAAAALCywgEAAAAAo8ck6DcSEPK9gYxsO5V%2BYsCKARA%3DGawYI0g1gWkqo8d0FfCb4F7qNwXrWxckP3igTn7mH0jS36yDib
const express = require('express');
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");

// twitter auth
const { TwitterApi } = require('twitter-api-v2');

const twitterClient = new TwitterApi({
  appKey: "BP68Sfnuv52Hpb4BJZzfGvN6j",
  appSecret: "JWgymqDBRfsfhZTk8IsvR0ww2HijJkIQuaf2OJeBs2lA5Oh4Aj",
  accessToken: "1851239489143705600-RklI6NyVvGaRYjs0a5gk3t1bU6LoR3",
  accessSecret: "xLAyArYltkv51HHx3eKLRC7gpInkOjmM79c7XnnIrWD3X"
});



router.post('/', asyncHandler(async (req, res) => {
    try {
      const { tweet } = req.body;
  
      // Validate tweet length
      if (!tweet || tweet.length > 280) {
        return res.status(400).json({ 
          error: 'Tweet must be between 1 and 280 characters' 
        });
      }
  
      const response = await twitterClient.v2.tweet(tweet);
  
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
