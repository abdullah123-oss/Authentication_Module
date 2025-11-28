import express from "express";
import { 
  getPublicMedicines,
  getPublicMedicineById
} from "../controllers/publicMedicineController.js";

const router = express.Router();

router.get("/", getPublicMedicines);
router.get("/:id", getPublicMedicineById);

export default router;
