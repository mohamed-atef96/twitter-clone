const mongoose = require("mongoose");

const schema = mongoose.Schema;

const UserSchema = new schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    likes: [{ type: schema.Types.ObjectId, ref: "Tweet" }],
    retweets: [{ type: schema.Types.ObjectId, ref: "Tweet" }],
  },
  { timestamps: true }
);

var USER = mongoose.model("User", UserSchema);
module.exports = USER;
