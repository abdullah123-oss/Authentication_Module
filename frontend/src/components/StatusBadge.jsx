export default function StatusBadge({ status }) {
  const base = "px-2 py-1 rounded text-xs font-semibold";

  const map = {
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    pending_payment: "bg-blue-100 text-blue-800",
    booked: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-700",
  };

  return (
    <span className={`${base} ${map[status] || "bg-gray-200 text-gray-700"}`}>
      {status === "pending_approval" && "Waiting for Approval"}
      {status === "approved" && "Doctor Approved — Please Pay"}
      {status === "pending_payment" && "Doctor Approved — Please Pay"}
      {status === "paid" && "Paid"}
      {status === "booked" && "Booked"}
      {status === "rejected" && "Rejected"}
      {status === "cancelled" && "Cancelled"}
    </span>
  );
}
