import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAvailabilityApi, setAvailabilityApi } from "../../../api/doctorApi";
import { FaRegClock, FaCalendarAlt, FaPlus, FaTrash } from "react-icons/fa";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MySchedule = () => {
  const [availability, setAvailability] = useState({});
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const data = await getAvailabilityApi();

        const formatted = {};
        data.slots?.forEach((dayData) => {
          formatted[dayData.day] = dayData.times.map((t) => ({
            startTime: t.start,
            endTime: t.end,
          }));
        });

        setAvailability(formatted);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleAddSlot = () => {
    if (!selectedDay || !startTime || !endTime) {
      return toast.error("Please select a day and time range!");
    }

    setAvailability((prev) => {
      const existingSlots = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: [...existingSlots, { startTime, endTime }],
      };
    });

    setStartTime("");
    setEndTime("");

    toast.success("Slot added!");
  };

  const handleDeleteSlot = (day, index) => {
    setAvailability((prev) => {
      const updated = [...prev[day]];
      updated.splice(index, 1);
      return { ...prev, [day]: updated };
    });

    toast("Slot removed", { icon: "🗑️" });
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);

      const slots = Object.keys(availability).map((day) => ({
        day,
        times: availability[day].map((t) => ({
          start: t.startTime,
          end: t.endTime,
        })),
      }));

      await setAvailabilityApi(slots);
      toast.success("Schedule saved successfully!");
    } catch (err) {
      toast.error("Failed to save schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* PAGE TITLE */}
      <div className="flex items-center gap-3">
        <FaCalendarAlt className="text-blue-600 text-2xl" />
        <h1 className="text-2xl font-semibold text-gray-800">Weekly Schedule</h1>
      </div>

      {/* ADD SLOT PANEL */}
      <div className="bg-white border rounded-xl shadow-sm p-6 flex flex-col md:flex-row items-center md:items-end gap-4">
        <div className="w-full md:w-1/4">
          <label className="text-sm text-gray-600">Select Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose day</option>
            {daysOfWeek.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-sm text-gray-600">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-sm text-gray-600">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAddSlot}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          <FaPlus />
          Add Slot
        </button>
      </div>

      {/* WEEKLY SCHEDULE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="bg-white border rounded-xl shadow-sm p-5"
          >
            {/* Day Header */}
            <div className="flex items-center gap-2 mb-4">
              <FaRegClock className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">{day}</h3>
            </div>

            {/* Slots */}
            {availability[day] && availability[day].length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availability[day].map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm"
                  >
                    <span className="text-gray-700">
                      {slot.startTime} - {slot.endTime}
                    </span>

                    <button
                      onClick={() => handleDeleteSlot(day, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No availability set
              </p>
            )}
          </div>
        ))}
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSchedule}
          disabled={loading}
          className={`px-6 py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
};

export default MySchedule;
