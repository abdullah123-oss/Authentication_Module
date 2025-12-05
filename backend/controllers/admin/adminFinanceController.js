import Appointment from "../../models/Appointment.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";

// Helper: get start & end of current month
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getFinanceDashboard = async (req, res) => {
  try {
    const { start, end } = getCurrentMonthRange();

    // -------- Appointments (paid only) --------
    const paidAppointments = await Appointment.find({
      paymentStatus: "paid",
      paidAt: { $ne: null },
    }).select("amount doctorEarning adminFee paidAt doctor");

    // -------- Orders (paid only) --------
    const paidOrders = await Order.find({
      paymentStatus: "paid",
      paidAt: { $ne: null },
    }).select("totalAmount paidAt items");

    // ---- Summary numbers ----
    const totalAppointmentRevenue = paidAppointments.reduce(
      (sum, a) => sum + (a.amount || 0),
      0
    );
    const totalOrderRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    const totalRevenue = totalAppointmentRevenue + totalOrderRevenue;

    const revenueThisMonthFromAppointments = paidAppointments
      .filter((a) => a.paidAt >= start && a.paidAt <= end)
      .reduce((sum, a) => sum + (a.amount || 0), 0);

    const revenueThisMonthFromOrders = paidOrders
      .filter((o) => o.paidAt >= start && o.paidAt <= end)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const revenueThisMonth =
      revenueThisMonthFromAppointments + revenueThisMonthFromOrders;

    const doctorEarningsTotal = paidAppointments.reduce(
      (sum, a) => sum + (a.doctorEarning || 0),
      0
    );

    const medicineRevenueTotal = totalOrderRevenue;

    // ---- Monthly revenue chart (last 12 months) ----
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}`,
        label: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    const monthlyMap = {};
    months.forEach((m) => {
      monthlyMap[m.key] = {
        month: m.label,
        year: m.year,
        totalRevenue: 0,
        appointmentRevenue: 0,
        orderRevenue: 0,
      };
    });

    paidAppointments.forEach((a) => {
      if (!a.paidAt) return;
      const d = new Date(a.paidAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyMap[key]) return;
      monthlyMap[key].appointmentRevenue += a.amount || 0;
      monthlyMap[key].totalRevenue += a.amount || 0;
    });

    paidOrders.forEach((o) => {
      if (!o.paidAt) return;
      const d = new Date(o.paidAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!monthlyMap[key]) return;
      monthlyMap[key].orderRevenue += o.totalAmount || 0;
      monthlyMap[key].totalRevenue += o.totalAmount || 0;
    });

    const monthlyRevenue = months.map((m) => monthlyMap[m.key]);

    // ---- Top 5 medicines ----
    const mongoose = (await import("mongoose")).default;
    const ObjectId = mongoose.Types.ObjectId;

    const topMedicinesAgg = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicineId",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    const topMedicines = topMedicinesAgg.map((m) => ({
      medicineId: m._id,
      name: m.name,
      totalSold: m.totalSold,
      revenue: m.revenue,
    }));

    // ---- Top earning doctors ----
    const topDoctorsAgg = await Appointment.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: "$doctor",
          totalAppointments: { $sum: 1 },
          earning: { $sum: { $ifNull: ["$doctorEarning", "$amount"] } },
        },
      },
      { $sort: { earning: -1 } },
      { $limit: 5 },
    ]);

    const doctorIds = topDoctorsAgg.map((d) => d._id).filter(Boolean);
    const doctorsMap = {};
    if (doctorIds.length) {
      const doctors = await User.find({ _id: { $in: doctorIds } }).select(
        "name email"
      );
      doctors.forEach((d) => {
        doctorsMap[d._id.toString()] = d;
      });
    }

    const topDoctors = topDoctorsAgg.map((d) => {
      const doc = doctorsMap[d._id?.toString()] || {};
      return {
        doctorId: d._id,
        name: doc.name || "Unknown Doctor",
        email: doc.email || "",
        totalAppointments: d.totalAppointments,
        earning: d.earning,
      };
    });

    res.json({
      summary: {
        totalRevenue,
        revenueThisMonth,
        doctorEarningsTotal,
        medicineRevenueTotal,
      },
      monthlyRevenue,
      topMedicines,
      topDoctors,
    });
  } catch (err) {
    console.error("Finance dashboard error:", err);
    res.status(500).json({ message: "Failed to load finance dashboard" });
  }
};


