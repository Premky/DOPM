import pool from "../utils/db3.js";

// Create Permission
export const createPermission=async({module_name, action_name})=>{  
  const sql = `INSERT INTO permissions(module_name, action) VALUES(?,?)`;
  const [result] = await pool.query(sql, [module_name, action_name]);
  return result;
};

//Delete Permission
export const deletePermission = async(id)=>{
  const sql = `DELETE FROM permissions WHERE id=?`;
  await pool.query(sql, [id]);
};

// Assign to Role 
export const assignRolePermissions=async(roleId, permissionIds)=>{
  const sql = `INSERT IGNORE INTO permissions_role(role_id, permission_id) VALUES ?`;
  const values=permissionIds.map(pid=>[roleId, pid]);
  await pool.query(sql, [values]);
};

// Revoke From Role
export const revokeRolePermission = async(roleId, permissionId)=>{
  const sql = `DELETE FROM permissions_role WHERE role_id=? AND permission_id=?`;
  await pool.query(sql, [roleId, permissionId]);
};

// Assign to User
export const assignUserPermissions=async(useInternalAdmins, permissionIds)=>{
  const sql = `INSERT IGNORE INTO permissions_user(user_id, permission_id) VALUES ?`;
  const values = permissionIds.map(pid=>[userId, pid]);
  await pool.query(sql, [values]);
}

// Revoke User Permission
export const revokeUserPermission=async(userId, permissionId)=>{
  const sql = `DELETE FROM permissions_user WHERE user_id=? AND permission_id=?`;
  await pool.query(sql, [userId, permissionId]);
}

//Get User Permission
export const getUserPermissions = async(userId)=>{
  const sql = `
          SELECT p.* 
          FROM user_permissions up
          JOIN permissions p ON up.permission_id=p.id
          WHERE up.user_id=?
          `;
  const [result]= await pool.query(sql, [userId]);
  return result;
}

export const getModules = async () => {
  const sql = "SELECT * FROM table_labels";
  const [result] = await pool.query(sql);
  return result;
};

export const getPermissions = async () => {
  const sql = "SELECT * FROM permissions";
  const [result] = await pool.query(sql);
  return result;
};

export const getRoles = async () => {
  const sql = "SELECT * FROM user_roles";
  const [result] = await pool.query(sql);
  return result;
};
