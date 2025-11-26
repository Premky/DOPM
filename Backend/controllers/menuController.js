// backend/controllers/menuController.js
import pool from "../utils/db3.js";

// ---------------------
// Fetch menus with roles
// ---------------------
export const getMenus = async (req, res) => {
  const user_id = req.user?.id;
  const role_id = req.user?.role_id;

  try {
    const [menus] = await pool.query(
      `SELECT m.id, m.title, m.icon, m.link, m.parent_id, m.order_no 
      FROM menus m 
      LEFT JOIN menus_role mr ON m.id=mr.menu_id
      
      ORDER BY m.parent_id, m.order_no ASC`,[role_id]
    );
    const [menuRoles] = await pool.query(
      `SELECT mr.menu_id, r.role_name AS roleName
       FROM menus_role mr
       JOIN user_roles r ON mr.role_id = r.id
       `,[role_id]
    );

    const menusWithRoles = menus.map((menu) => ({
      ...menu,
      roles: menuRoles.filter((mr) => mr.menu_id === menu.id).map((r) => r.roleName),
    }));

    res.json(menusWithRoles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch menus" });
  }
};

// ---------------------
// Create menu
// ---------------------
export const createMenu = async (req, res) => {
  const { parent_id, title, icon, link, order_no, roles = [] } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "INSERT INTO menus (parent_id, title, icon, link, order_no ) VALUES (?, ?, ?, ?, ?)",
      [parent_id || null, title, icon, link, order_no]
    );    
    const menuId = result.insertId;
    
    console.log(`Menu Inserted with ID:`, menuId);

    for (let roleName of roles) {
      const [role] = await connection.query("SELECT id FROM user_roles WHERE role_name=?", [roleName]);
      if (role.length) {
        await connection.query("INSERT INTO menus_role (menu_id, role_id) VALUES (?, ?)", [menuId, role[0].id]);
      }
    }
    await connection.commit();
    res.json({ success: true, id: menuId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to create menu" });
  } finally {
    connection.release();
  }
};

// ---------------------
// Update menu
// ---------------------

export const updateMenu = async (req, res) => {
  const menuId = req.params.id;
  const { parent_id, title, icon, link, order_no, roles = [] } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "UPDATE menus SET parent_id=?, title=?, icon=?, link=?, order_no=? WHERE id=?",
      [parent_id || null, title, icon, link, order_no, menuId]
    );

    await connection.query("DELETE FROM menus_role WHERE menu_id=?", [menuId]);

    for (let roleName of roles) {
      const [role] = await connection.query("SELECT id FROM user_roles WHERE role_name=?", [roleName]);
      if (role.length) {
        await connection.query("INSERT INTO menus_role (menu_id, role_id) VALUES (?, ?)", [menuId, role[0].id]);
      }
    }

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to update menu" });
  } finally {
    connection.release();
  }
};

// ---------------------
// Delete menu
// ---------------------
export const deleteMenu = async (req, res) => {
  const menuId = req.params.id;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM menus_role WHERE menu_id=?", [menuId]);
    await connection.query("DELETE FROM menus WHERE id=?", [menuId]);
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to delete menu" });
  } finally {
    connection.release();
  }
};

// ---------------------
// Reorder menus
// ---------------------
export const reorderMenus = async (req, res) => {
  const menus = req.body; // [{id, parentId, orderIndex}]
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (let m of menus) {
      await connection.query("UPDATE menus SET parent_Id=?, order_no=? WHERE id=?", [m.parentId || null, m.orderIndex, m.id]);
    }
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to reorder menus" });
  } finally {
    connection.release();
  }
};

// ---------------------
// Get all roles
// ---------------------
export const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT id, role_name AS name FROM user_roles");
    res.json(roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};
