const express = require("express");
const router = express.Router();
const {
  addSubscription,
  getSubscriptions,
  getSummary,
  updateSubcription,
  deleteSubscription,
} = require("../controllers/subController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, addSubscription);
router.get("/", authenticateToken, getSubscriptions);
router.get("/summary", authenticateToken, getSummary);
router.put("/:id", authenticateToken, updateSubcription);
router.delete("/:id", authenticateToken, deleteSubscription);

module.exports = router;
