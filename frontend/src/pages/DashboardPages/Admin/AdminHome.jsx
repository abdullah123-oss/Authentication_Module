// AdminHome.jsx
import React, { useEffect, useState } from "react";
import API from "../../../api/axios";

export default function AdminHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await API.get("/admin/stats");
      setStats(data);
    };
    load();
  }, []);

  if (!stats)
    return <p className="text-center text-gray-500 py-10">Loading stats...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard label="Total Patients" value={stats.totalPatients} />
      <StatCard label="Total Doctors" value={stats.totalDoctors} />
      <StatCard label="Total Appointments" value={stats.totalAppointments} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/90 backdrop-blur shadow-xl rounded-xl p-6 text-center border hover:shadow-2xl transition">
      <h2 className="text-3xl font-bold text-indigo-700">{value}</h2>
      <p className="text-gray-500 mt-1">{label}</p>
    </div>
  );
}
