const express = require("express");
const passport = require("passport");
const { register, login, updateUserRole } = require("../controllers/authController");
const generateToken = require('../utils/generateToken'); // adjust path if needed

const router = express.Router();

// 🔹 Regular login & registration
router.post("/register", register);
router.post("/login", login);
router.put("/update-role", updateUserRole);

// 🔹 Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user.id);
    const name = req.user.name;
    const role = req.user.role || "user";

    // ✅ Redirect to frontend with token and user info as query params
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&name=${encodeURIComponent(name)}&role=${role}`);
  }
);

// Facebook OAuth
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get("/facebook/callback", 
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user.id);
    const name = req.user.name;
    const role = req.user.role || "user";

    // Redirect to frontend
    res.redirect(`http://localhost:3000/oauth-success?token=${token}&name=${encodeURIComponent(name)}&role=${role}`);
  }
);


module.exports = router;
