import express from "express";
import pool from "../utils/db3.js";
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();
import {

  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
  getRoles
} from "../controllers/menuController.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import { getModules, getPermissions } from "../controllers/permissionController.js";

// Menus
router.get("/modules", verifyToken,  getModules);
router.get("/permissions", verifyToken,  getPermissions);
router.get("/roles", verifyToken, verifyRole('superadmin','admin', 'clerk'), getRoles);
router.post("/menus", verifyToken, verifyRole('superadmin','admin'), createMenu);
router.put("/menus/:id", verifyToken, verifyRole('superadmin','admin'), updateMenu);
router.delete("/menus/:id", verifyToken, verifyRole('superadmin','admin'), deleteMenu);
router.post("/menus/reorder", verifyToken, verifyRole('superadmin','admin'), reorderMenus);

// Roles
router.get("/roles", getRoles);

export { router as permissionRouter };