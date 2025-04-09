import { Router } from "express";
import {
  registerCustomer,
  verifyEmail,
  login,
  registerAdmin,
} from "../controller/userController";

const router = Router();

router.post("/register/customer", registerCustomer);
router.post("/register/admin", registerAdmin);
router.post("/verify-email", verifyEmail);
router.post("/login", login);

export { router as userRoutes };
