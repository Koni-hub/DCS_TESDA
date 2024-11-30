import express from "express";
import passport from "passport";
import "dotenv/config";

const CLIENT_URL = process.env.CLIENT_URL;

const router = express.Router();

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(`${CLIENT_URL}/login`);
  });
});

router.get("/login/success", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
    console.log("User Authenticated Successfully");
  } else {
    res.status(401).json({ error: "Unauthorized" });
    console.log("User Unauthorized");
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback/",
  passport.authenticate("google", {
    successRedirect: `${CLIENT_URL}/dashboard`,
    failureRedirect: `${CLIENT_URL}/login/failed`,
  })
);

export default router;
