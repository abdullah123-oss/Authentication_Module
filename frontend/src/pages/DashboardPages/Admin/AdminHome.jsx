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

  if (!stats) return <p>Loading stats...</p>;

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
    <div className="p-6 bg-white shadow-lg rounded-xl text-center border">
      <h2 className="text-2xl font-bold text-indigo-700">{value}</h2>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}
