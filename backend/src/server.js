const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const subRoutes = require("./routes/subRoutes");
app.use("/api/subs", subRoutes);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://sub-tracker-blush.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

// Tes Koneksi Database
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Berhasil terhubung ke Supabase PostgreSQL!");
  } catch (error) {
    console.error("❌ Gagal terhubung ke database:", error);
  }
}

testConnection();

app.get("/", (req, res) => {
  res.send("Server Running...");
});

// Import model
const { User, Subscription } = require("./models/index");

// Sinkronisasi database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✨ Tabel database berhasil disinkronkan!");
  })
  .catch((err) => {
    console.error("❌ Gagal sinkronisasi tabel:", err);
  });

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
