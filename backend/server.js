const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const passport = require("passport");
const session = require("express-session");

dotenv.config();
const app = express();

// ✅ Load Passport Configuration
require("./config/passport"); 

// ✅ Setup session for OAuth authentication
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret",
  resave: false,
  saveUninitialized: true,
}));

// ✅ Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// ✅ Setup CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middleware to handle headers for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// ✅ Serve static files with explicit CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// ✅ Import and use routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categories");
const brandRoutes = require("./routes/brands");
const productRoutes = require("./routes/products");
const searchRoutes = require("./routes/search");
const cartRoutes = require("./routes/cart"); 
const checkoutRoutes = require("./routes/checkout");
const ratingsRoutes = require("./routes/ratings");
const ordersRoutes = require("./routes/orders"); // Import orders routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/cart", cartRoutes); 
app.use("/api/checkout", checkoutRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/orders", ordersRoutes);

// ✅ Check server status
app.get("/api/status", (req, res) => {
  res.json({ message: "Server is running!", timestamp: new Date() });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
