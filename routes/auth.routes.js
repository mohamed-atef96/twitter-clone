const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const USER = require("../models/users.model");

router.get("/login", (req, res) => {
  const payload = {
    title: "login",
  };
  res.render("login", payload);
});

router.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  const payload = req.body;

  if (userName && password) {
    const user = await USER.findOne({
      $or: [{ userName: userName }, { email: userName }],
    });
    if (!user) {
      payload.errorMessage = "Login credentials incorrect.";
      return res.status(403).render("login", payload);
    }
    const validPassword = bcrypt.compareSync(password, user.password);
    if (validPassword) {
      req.session.user = user;
      return res.redirect("/");
    } else {
      payload.errorMessage = "Login credentials incorrect.";
      return res.status(403).render("login", payload);
    }
  }
  payload.errorMessage = "Make sure each field has a valid value.";
  res.status(200).render("login");
});

router.get("/register", (req, res) => {
  const payload = {
    title: "register",
  };
  res.render("register", payload);
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
  const payload = req.body;

  if (firstName && lastName && userName && email && password) {
    const userExist = await USER.findOne({
      $or: [{ userName: userName }, { email: email }],
    });

    if (userExist) {
      if (email == userExist.email) {
        payload.errorMessage = "Email already in use.";
        return res.status(403).render("register", payload);
      } else {
        payload.errorMessage = "Username already in use.";
        return res.status(403).render("register", payload);
      }
    }
    const hashPassword = bcrypt.hashSync(password, 10);
    let user = await new USER({
      firstName,
      lastName,
      userName,
      email,
      password: hashPassword,
    });

    user = await user.save();
    if (user) {
      req.session.user = user;
      return res.redirect("/");
    } else {
      return res.json({
        msg: "there is an error cannot create user right now",
      });
    }
  }
});

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/auth/login");
    });
  }
});
module.exports = router;
