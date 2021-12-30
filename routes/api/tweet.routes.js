const express = require("express");
const router = express.Router();
const TWEET = require("../../models/tweet.model");
const multer = require("multer");
const USER = require("../../models/users.model");
const upload = multer();

//retrieve all tweets
router.get("/get", async (req, res) => {
  const tweets = await TWEET.find({})
    .populate({
      path: "postedBy",
      select: "-password",
    })
    .populate({ path: "retweetData", populate: { path: "postedBy" } })
    .populate({ path: "replyTo", populate: { path: "postedBy" } })
    .sort({ createdAT: -1 });

  if (tweets) return res.status(200).send(tweets);
  return res.status(500).json({ msg: "cannot retrieve right now" });
});

// retrieve tweet by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const tweet = await TWEET.findById(id)
    .populate({
      path: "postedBy",
      select: "-password",
    })
    .populate({ path: "retweetData", populate: { path: "postedBy" } })
    .sort({ createdAT: -1 });

  if (tweet) return res.status(200).send(tweet);
  return res.status(500).json({ msg: "cannot retrieve right now" });
});


// retrieve tweet by user id
router.get("/get/user/:id", async (req, res) => {
  const { id } = req.params;
  const tweet = await TWEET.find({postedBy:id})
    .populate({
      path: "postedBy",
      select: "-password",
    })
    .populate({ path: "retweetData", populate: { path: "postedBy" } })
    .sort({ createdAT: -1 });

  if (tweet) return res.status(200).send(tweet);
  return res.status(500).json({ msg: "cannot retrieve right now" });
});
// retrieve replies to tweet
router.post("/get/replies", upload.none(), async (req, res) => {
  const { tweetId } = req.body;
  const tweet = await TWEET.find({ replyTo: tweetId })
    .populate({
      path: "postedBy",
      select: "-password",
    })
    .populate({ path: "retweetData", populate: { path: "postedBy" } })
    .populate({ path: "replyTo", populate: { path: "postedBy" } })
    .sort({ createdAT: 1 });

  if (tweet) return res.status(200).send(tweet);
  return res.status(500).json({ msg: "cannot retrieve right now" });
});

//create new tweet
router.post("/create", upload.none(), async (req, res) => {
  const { content } = req.body;
  if (content) {
    const userId = req.session.user._id;
    let tweet = await new TWEET({ content, postedBy: userId }).populate({
      path: "postedBy",
      select: "-password",
    });
    tweet = await tweet.save();
    if (tweet) return res.status(200).send(tweet);
    return res.status(500).json({ msg: "error cannot create tweet" });
  }
  return res.status(400).json({ msg: "fields are missed" });
});
//like
router.put("/like/:id", async (req, res) => {
  const tweetId = req.params.id;
  const userId = req.session.user._id;
  const isLiked = await USER.findOne({ _id: userId, likes: tweetId });

  let action = isLiked ? "$pull" : "$push";
  let msg = isLiked ? "tweet unliked" : "$tweet liked";
  // add or remove like to user
  const userLike = await USER.findByIdAndUpdate(userId, {
    [action]: { likes: tweetId },
  });
  // add or remove like to tweet
  const tweetLike = await TWEET.findByIdAndUpdate(
    tweetId,
    {
      [action]: { likes: userId },
    },
    { new: true }
  );

  if (userLike && tweetLike) return res.status(200).send(tweetLike);

  return res.status(400).json({ msg: "cannot like tweet right now" });
});
//retweet
router.put("/retweet/:id", async (req, res) => {
  const tweetId = req.params.id;
  const userId = req.session.user._id;

  var removedRetweet = await TWEET.findOneAndDelete({
    postedBy: userId,
    retweetData: tweetId,
  });
  console.log(removedRetweet);
  let action = removedRetweet != null ? "$pull" : "$push";
  let msg = removedRetweet != null ? "retweet removed" : "retweeted";
  let retweet = removedRetweet;
  if (removedRetweet == null) {
    retweet = await new TWEET({
      postedBy: userId,
      retweetData: tweetId,
    });
    await retweet.save();
  }

  // add or remove retweet to user
  const userRetweet = await USER.findByIdAndUpdate(
    userId,
    {
      [action]: { retweets: retweet._id },
    },
    { new: true }
  );
  // add or remove like to tweet
  const tweetRetweets = await TWEET.findByIdAndUpdate(
    tweetId,
    {
      [action]: { retweets: userId },
    },
    { new: true }
  );

  if (userRetweet && tweetRetweets) return res.status(200).send(tweetRetweets);

  return res.status(400).json({ msg: "cannot retweet tweet right now" });
});

//reply
router.post("/reply", upload.none(), async (req, res) => {
  const { content, replyTo } = req.body;
  if (content && replyTo) {
    const userId = req.session.user._id;
    let tweet = await new TWEET({
      content,
      postedBy: userId,
      replyTo,
    }).populate({
      path: "postedBy",
      select: "-password",
    });
    tweet = await tweet.save();
    if (tweet) return res.status(200).send(tweet);
    return res.status(500).json({ msg: "error cannot create tweet" });
  }
  return res.status(400).json({ msg: "fields are missed" });
});

// render tweet page
router.get("/view/:id", (req, res) => {
  var payload = {
    pageTitle: "View Tweet",
    userLoggedIn: req.session.user,
    userJs: JSON.stringify(req.session.user),
    tweetId: req.params.id,
  };

  res.render("tweets", payload);
});

// delete tweet
router.delete("/:id", async (req, res, next) => {
  const deleted = await TWEET.findByIdAndDelete(req.params.id)
 if(deleted) return res.status(200).json({msg:"tweet deleted successfully"})
 return res.status(400).json({msg:'cannot delete tweet right now'})
})

module.exports = router;
