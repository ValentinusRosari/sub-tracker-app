const { Subscription } = require("../models");

const getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.findAll({
      where: { userId: req.user.id },
      order: [["nextBillingDate", "ASC"]],
    });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions", error: error.message });
  }
};

const addSubscription = async (req, res) => {
  try {
    const { name, price, billingCycle, startDate, category } = req.body;

    // Logika menghitung nextBillingDate
    const start = new Date(startDate);
    let next = new Date(startDate);
    if (billingCycle === "monthly") {
      next.setMonth(start.getMonth() + 1);
    } else {
      next.setFullYear(start.getFullYear() + 1);
    }

    const newSub = await Subscription.create({
      name,
      price,
      billingCycle,
      startDate,
      nextBillingDate: next,
      category,
      userId: req.user.id,
    });
    res.status(201).json({ message: "Subscription added successfully", data: newSub });
  } catch (error) {
    res.status(500).json({ message: "Failed to add subscription", error: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const subs = await Subscription.findAll({ where: { userId: req.user.id } });

    let totalMonthly = 0;
    subs.forEach((sub) => {
      const price = parseFloat(sub.price);
      if (sub.billingCycle === "monthly") {
        totalMonthly += price;
      } else {
        totalMonthly += price / 12;
      }
    });

    res.json({
      totalMonthly: totalMonthly.toFixed(2),
      count: subs.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSubcription = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, billingCycle, category } = req.body;

    const sub = await Subscription.findOne({ where: { id, userId: req.user.id } });
    if (!sub) return res.status(404).json({ message: "Subscription not found" });

    await sub.update({ name, price, billingCycle, category });
    res.json({ message: "Subscription updated successfully", data: sub });
  } catch (error) {
    res.status(500).json({ message: "Failed to update subscription", error: error.message });
  }
};

const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Subscription.destroy({ where: { id, userId: req.user.id } });

    if (!deleted) return res.status(404).json({ message: "Subscription not found" });
    res.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subscription", error: error.message });
  }
};

module.exports = {
  addSubscription,
  getSubscriptions,
  getSummary,
  updateSubcription,
  deleteSubscription,
};
