const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const subRoutes = require("./routes/subRoutes");
app.use("/api/subs", subRoutes);
