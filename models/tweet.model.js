const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tweetSchema = new schema(
  {
    content: { type: String, trim: true },
    postedBy: { type: schema.Types.ObjectId, ref: "User" },
    pinned: { type: Boolean, default: false },
    likes: [{ type: schema.Types.ObjectId, ref: "User" }],
    retweets: [{ type: schema.Types.ObjectId, ref: "User" }],
    retweetData: { type: schema.Types.ObjectId, ref: "Tweet" },
    replyTo: { type: schema.Types.ObjectId, ref: "Tweet" }
  },
  { timestamps: true }
);

const TWEET = mongoose.model("Tweet", tweetSchema);
module.exports = TWEET;
