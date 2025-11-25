import express from "express";
import pool from "../utils/db3.js";
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
  getRoles
} from "../controllers/menuController.js";

// Menus
router.get("/get_menus", getMenus);
router.get("/roles", getRoles);
router.post("/menus", createMenu);
router.put("/menus/:id", updateMenu);
router.delete("/menus/:id", deleteMenu);
router.post("/menus/reorder", reorderMenus);

// Roles
router.get("/roles", getRoles);

export { router as menuRouter };