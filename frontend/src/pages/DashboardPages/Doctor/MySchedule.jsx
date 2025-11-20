import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAvailabilityApi, setAvailabilityApi } from "../../../api/doctorApi";

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

  // ✅ Fetch availability on mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const data = await getAvailabilityApi();

        // Convert backend format → frontend format
        // [{day: "Monday", times:[{start, end}]}] => { Monday: [{startTime, endTime}], ... }
        const formatted = {};
        data.slots?.forEach((dayData) => {
          formatted[dayData.day] = dayData.times.map((t) => ({
            startTime: t.start,
            endTime: t.end,
          }));
        });

        setAvailability(formatted);
      } catch (err) {
        console.error("Fetch availability failed:", err);
        toast.error("Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // ✅ Add a new time slot locally
  const handleAddSlot = () => {
    if (!selectedDay || !startTime || !endTime) {
      toast.error("Please select a day and time range!");
      return;
    }

    setAvailability((prev) => {
      const existingSlots = prev[selectedDay] || [];
      const newSlot = { startTime, endTime };
      return {
        ...prev,
        [selectedDay]: [...existingSlots, newSlot],
      };
    });

    setStartTime("");
    setEndTime("");
    toast.success("Slot added successfully!");
  };

  // ✅ Delete a time slot
  const handleDeleteSlot = (day, index) => {
    setAvailability((prev) => {
      const updatedSlots = [...prev[day]];
      updatedSlots.splice(index, 1);
      return { ...prev, [day]: updatedSlots };
    });
    toast("Slot removed!", { icon: "🗑️" });
  };

  // ✅ Save to backend
  const handleSaveSchedule = async () => {
    try {
      setLoading(true);

      // Convert frontend format → backend format
      // { Monday:[{startTime,endTime}], ... } => [{ day:"Monday", times:[{start,end}]}]
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
      console.error("Save schedule failed:", err);
      toast.error("Failed to save schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">My Weekly Schedule</h2>

      {/* Loading indicator */}
      {loading && <p className="text-blue-500">Loading...</p>}

      {/* Day selector */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="">Select Day</option>
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border rounded-lg p-2"
        />
        <span>to</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border rounded-lg p-2"
        />

        <button
          onClick={handleAddSlot}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Slot
        </button>
      </div>

      {/* Slots list */}
      <div className="mt-4 space-y-4">
        {Object.keys(availability).length === 0 ? (
          <p className="text-gray-500">No slots added yet.</p>
        ) : (
          daysOfWeek.map(
            (day) =>
              availability[day] && (
                <div key={day} className="border p-3 rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-2">{day}</h3>
                  <div className="flex flex-wrap gap-2">
                    {availability[day].map((slot, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1 shadow-sm"
                      >
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <button
                          onClick={() => handleDeleteSlot(day, i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )
        )}
      </div>

      {/* Save button */}
      <div className="mt-6">
        <button
          onClick={handleSaveSchedule}
          disabled={loading}
          className={`${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          } text-white px-6 py-2 rounded-lg`}
        >
          {loading ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
};

export default MySchedule;
