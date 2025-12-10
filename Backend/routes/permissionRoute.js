import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { verifyRole } from "../middlewares/verifyRole.js";
import {
  getModules,
  getPermissions,
  getRoles
} from "../controllers/permissionController.js";
import { getMenus } from "../controllers/menuController.js";
import { assignRolePermissions, assignUserPermissions, createPermission, deletePermission, getUserPermissions, revokeRolePermission, revokeUserPermission } from "../services/permissionService.js";

const router = express.Router();

// Permissions Routes
router.post("/permissions", createPermission);
router.delete("/permissions/:id", verifyToken, deletePermission);

//Role Permissions
router.post("/roles/:roleId/permissions", verifyToken, assignRolePermissions);
router.delete("/roles/:roleId/permissions/:permissionId", verifyToken, revokeRolePermission);

// User Permissions
router.post("/users/:userId/permissions", verifyToken, assignUserPermissions);
router.delete("users/:userId/permissions/permissionId", verifyToken, revokeUserPermission);
router.get("/user/:/userId/permissions", verifyToken, getUserPermissions);

router.get( "/permissions", verifyToken, getPermissions );

router.get("/user_menus", verifyToken, getMenus);
router.get( "/modules", verifyToken, getModules );

router.get(
  "/roles",
  verifyToken,
  // verifyRole("superadmin", "admin", "clerk"),
  getRoles
);

export { router as permissionRouter };
