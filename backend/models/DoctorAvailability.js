import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true }, // "08:00"
  end: { type: String, required: true },   // "09:00"
});

const daySlotsSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  times: [timeSlotSchema],
});

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // each doctor has one availability doc
    },
    slots: [daySlotsSchema],
  },
  { timestamps: true }
);

export default mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
