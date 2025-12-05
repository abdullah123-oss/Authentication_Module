// AdminHome.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api/axios";

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, financeRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/finance/dashboard"),
        ]);
        setStats(statsRes.data);
        setFinance(financeRes.data);
      } catch (err) {
        console.error("AdminHome load error", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading dashboard...</p>;
  }

  if (error || !stats || !finance) {
    return (
      <p className="text-center text-red-500 py-10">
        {error || "Failed to load dashboard"}
      </p>
    );
  }

  const { summary, monthlyRevenue, topMedicines, topDoctors } = finance;

  return (
    <div className="space-y-8">
      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Patients" value={stats.totalPatients} />
        <StatCard label="Total Doctors" value={stats.totalDoctors} />
        <StatCard label="Total Appointments" value={stats.totalAppointments} />
        <StatCard
          label="Total Revenue"
          value={`Rs ${summary.totalRevenue.toFixed(0)}`}
          accent="indigo"
        />
      </div>

      {/* Finance summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Revenue This Month"
          value={`Rs ${summary.revenueThisMonth.toFixed(0)}`}
          accent="green"
        />
        <StatCard
          label="Doctor Earnings / Payouts"
          value={`Rs ${summary.doctorEarningsTotal.toFixed(0)}`}
          accent="blue"
        />
        <StatCard
          label="Medicine Sales Revenue"
          value={`Rs ${summary.medicineRevenueTotal.toFixed(0)}`}
          accent="purple"
        />
      </div>

      {/* Middle: Monthly revenue chart */}
      <div className="bg-white rounded-2xl shadow-md border p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Monthly Revenue (Last 12 Months)
        </h3>
        <RevenueBarChart data={monthlyRevenue} />
      </div>

      {/* Bottom: Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMedicinesTable data={topMedicines} />
        <TopDoctorsTable data={topDoctors} />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "indigo" }) {
  const accentColor =
    accent === "green"
      ? "text-green-700"
      : accent === "blue"
      ? "text-blue-700"
      : accent === "purple"
      ? "text-purple-700"
      : "text-indigo-700";

  return (
    <div className="bg-white/90 backdrop-blur shadow-xl rounded-xl p-6 text-center border hover:shadow-2xl transition">
      <h2 className={`text-2xl md:text-3xl font-bold ${accentColor}`}>{value}</h2>
      <p className="text-gray-500 mt-1 text-sm md:text-base">{label}</p>
    </div>
  );
}

function RevenueBarChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 text-sm">No revenue data yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.totalRevenue || 0), 1);

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((d, idx) => {
        const value = d.totalRevenue || 0;
        const heightPercent = Math.round((value / max) * 100);
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-indigo-100 rounded-t-md relative group"
              style={{ height: `${heightPercent || 5}%` }}
              title={`Rs ${value.toFixed(0)}`}
            >
              <div className="absolute inset-x-0 bottom-0 h-full bg-indigo-500 rounded-t-md group-hover:bg-indigo-600 transition-colors" />
            </div>
            <span className="text-xs text-gray-500">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function TopMedicinesTable({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Top 5 Selling Medicines
      </h3>
      {(!data || data.length === 0) ? (
        <p className="text-gray-500 text-sm">No medicine sales yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-2 text-left">Medicine</th>
              <th className="py-2 text-right">Units Sold</th>
              <th className="py-2 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.medicineId} className="border-b last:border-0">
                <td className="py-2">{m.name}</td>
                <td className="py-2 text-right">{m.totalSold}</td>
                <td className="py-2 text-right">Rs {m.revenue.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TopDoctorsTable({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Top Earning Doctors
      </h3>
      {(!data || data.length === 0) ? (
        <p className="text-gray-500 text-sm">No doctor earnings yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-2 text-left">Doctor</th>
              <th className="py-2 text-right">Appointments</th>
              <th className="py-2 text-right">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.doctorId} className="border-b last:border-0">
                <td className="py-2">
                  <div className="flex flex-col">
                    <span>{d.name}</span>
                    {d.email && (
                      <span className="text-xs text-gray-500">{d.email}</span>
                    )}
                  </div>
                </td>
                <td className="py-2 text-right">{d.totalAppointments}</td>
                <td className="py-2 text-right">Rs {d.earning.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
