import PDFDocument from "pdfkit";
import Order from "../models/Order.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// Helper: Draw a simple divider line
const drawLine = (doc) => {
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke("#cccccc");
};

/* ---------------- ORDER INVOICE ---------------- */
export const downloadOrderInvoice = async (req,res)=>{
  try{
    const {orderId}=req.params;
    const order=await Order.findById(orderId).populate("userId","name email");
    if(!order) return res.status(404).json({message:"Order not found"});

    const doc=new PDFDocument({margin:50});
    res.setHeader("Content-Type","application/pdf");
    res.setHeader(
  "Content-Disposition",
  `attachment; filename=Invoice-${order.invoiceNumber}.pdf`
);


    doc.pipe(res);

    doc.fontSize(26).fillColor("#1e40af").text("MEDCARE")
       .fontSize(10).fillColor("gray").text("Healthcare & Pharmacy Service").moveDown(1);

    doc.moveTo(50,doc.y).lineTo(550,doc.y).stroke("#cccccc").moveDown(1);

    doc.fontSize(14).fillColor("black")
       .text(`Invoice #: ${order.invoiceNumber}`)
       .text(`Transaction: ${order.transactionId?.slice(0,10)}...`)  // 👈 trimmed for clean look
       .text(`Date: ${new Date(order.paidAt).toLocaleDateString()}`)
       .moveDown(1);

    doc.fontSize(14).fillColor("#1e40af").text("Customer Details",{underline:true}).moveDown(0.5);
    doc.fontSize(12).fillColor("black")
       .text(`Name: ${order.userId.name}`)
       .text(`Email: ${order.userId.email}`).moveDown(1);

    doc.moveTo(50,doc.y).lineTo(550,doc.y).stroke("#cccccc").moveDown(1);

    doc.fontSize(14).fillColor("#1e40af").text("Order Items:",{underline:true}).moveDown(0.7);
    order.items.forEach(i=>{
      doc.fontSize(12).fillColor("black")
        .text(`${i.name} (x${i.quantity}) — Rs ${i.price*i.quantity}`);
    });

    doc.moveDown(1).moveTo(50,doc.y).lineTo(550,doc.y).stroke("#cccccc").moveDown(1);

    doc.fontSize(16).fillColor("#1e40af").text(`Total Amount: Rs ${order.totalAmount}`,{align:"right"}).moveDown(2);

    doc.fontSize(12).fillColor("gray")
       .text("Thank you for your purchase!",{align:"center"})
       .text("MedCare © All rights reserved",{align:"center"});

    doc.end();
  }catch(err){res.status(500).json({message:"Invoice error"});}
};


/* ------------- APPOINTMENT INVOICE ------------- */
export const downloadAppointmentInvoice = async(req,res)=>{
  try{
    const {appointmentId}=req.params;
    const appt=await Appointment.findById(appointmentId)
      .populate("patient","name email")
      .populate("doctor","name email");

    if(!appt) return res.status(404).json({message:"Appointment not found"});

    const doc=new PDFDocument({margin:50});
    res.setHeader("Content-Type","application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Appointment-${appt.invoiceNumber || appointmentId}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(26).fillColor("#1e40af").text("MEDCARE")
       .fontSize(10).fillColor("gray").text("Appointment Payment Receipt").moveDown(1);

    doc.moveTo(50,doc.y).lineTo(550,doc.y).stroke("#cccccc").moveDown(1);

    doc.fontSize(14).fillColor("black")
       .text(`Invoice #: ${appt.invoiceNumber}`)
       .text(`Transaction: ${appt.transactionId?.slice(0,10)}...`) // 👈 cleaner visual
       .text(`Paid At: ${new Date(appt.paidAt).toLocaleDateString()}`)
       .text(`Amount: Rs ${appt.amount}`).moveDown(1);

    doc.fontSize(14).fillColor("#1e40af").text("Patient Details",{underline:true}).moveDown(0.5);
    doc.fontSize(12).fillColor("black")
       .text(`Name: ${appt.patient.name}`)
       .text(`Email: ${appt.patient.email}`).moveDown(1);

    doc.fontSize(14).fillColor("#1e40af").text("Doctor Details",{underline:true}).moveDown(0.5);
    doc.fontSize(12).fillColor("black")
       .text(`Doctor: ${appt.doctor.name}`).moveDown(1);

    doc.moveTo(50,doc.y).lineTo(550,doc.y).stroke("#cccccc").moveDown(2);

    doc.fontSize(12).fillColor("gray")
       .text("Thank you for choosing MedCare!",{align:"center"})
       .text("MedCare © All rights reserved",{align:"center"});

    doc.end();
  }catch(err){res.status(500).json({message:"Invoice error"});}
};
