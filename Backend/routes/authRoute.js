import express from 'express';
import pool from '../utils/db3.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import verifyToken from '../middlewares/verifyToken.js';
import { promisify } from 'util';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for login and password reset
const authLimiter = rateLimit( {
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10, // limit each IP to 10 requests per window
  message: { success: false, message: "Too many attempts, please try later." }
} );

// Hash password
const hashPassword = async ( password ) => {
  const salt = await bcrypt.genSalt( 10 );
  return await bcrypt.hash( password, salt );
};

// Compare password
const comparePassword = async ( plain, hash ) => await bcrypt.compare( plain, hash );


// Validate user input for create/update/reset
const validateUserFields = ( { username, password, repassword, name_np } ) => {
  if ( !username || !password || !repassword || !name_np ) return "सबै फिल्डहरू आवश्यक छन्।";
  if ( password !== repassword ) return "पासवर्डहरू मिलेन।";

  // Password Strength Check
  // const strongPassowrdCombination = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  let strongPassowrdCombination = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if ( !strongPassowrdCombination.test( password ) ) {
    return "पासवर्ड कम्तिमा 8 अक्षर लामो, एक ठूलो अक्षर, एक सानो अक्षर र एक अंक समावेश गर्नुपर्छ।";
  }
  return null;
};

// Create User
router.post( "/create_user", verifyToken, async ( req, res ) => {
  const active_office = req.user.office_id;
  const active_user = req.user.id;

  try {
    const { name_np, username, userrole, password, repassword, office, branch, is_active } = req.body;
    const errorMsg = validateUserFields( { username, password, repassword, name_np } );
    if ( errorMsg ) return res.status( 400 ).json( { message: errorMsg } );

    const current_office = office || active_office;

    // Check existing user
    const [existingUser] = await pool.query( "SELECT id FROM users WHERE user_login_id = ?", [username] );
    if ( existingUser.length > 0 ) return res.status( 400 ).json( { message: "यो प्रयोगकर्ता नाम पहिल्यै अवस्थित छ।" } );

    const hashedPassword = await hashPassword( password );

    const sql = `
      INSERT INTO users
      (user_name, user_login_id, role_id, password, office_id, branch_id, is_active,
       created_by, updated_by, created_at, updated_at, created_office_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query( sql, [
      name_np, username, userrole, hashedPassword, current_office, branch, is_active,
      active_user, active_user, new Date(), new Date(), active_office
    ] );

    return res.json( { Status: true, Result: result } );
  } catch ( error ) {
    console.error( "User creation error:", error );
    return res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
  }
} );

// Get Users
router.get( "/get_users", verifyToken, async ( req, res ) => {
  const active_office = req.user.office_id;
  const active_role = req.user.role_name;

  if ( !['superadmin', 'office_superadmin'].includes( active_role ) ) {
    return res.status( 403 ).json( { Status: false, message: 'Access Denied' } );
  }

  try {
    let filters = '';
    const params = [];
    if ( active_role === 'office_superadmin' ) {
      filters = 'WHERE u.office_id = ?';
      params.push( active_office );
    }

    const sql = `
      SELECT u.*, ur.role_name AS usertype_en, o.office_name_with_letter_address, b.branch_np, e.mobile_no
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      LEFT JOIN offices o ON u.office_id = o.id
      LEFT JOIN branch b ON u.branch_id = b.id
      LEFT JOIN employees e ON u.user_login_id = e.sanket_no
      ${ filters }
      ORDER BY u.id
    `;

    const [result] = await pool.query( sql, params );
    console.log( result );
    return res.json( { Status: true, Result: result } );
  } catch ( error ) {
    console.error( "Get users error:", error );
    return res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
  }
} );

// Update User
router.put( "/update_user/:userid", verifyToken, async ( req, res ) => {
  const active_office = req.user.office_id;
  const { userid } = req.params;

  try {
    const { name_np, username, userrole, password, repassword, office, branch, is_active } = req.body;
    const errorMsg = validateUserFields( { username, password, repassword, name_np } );
    if ( errorMsg ) return res.status( 400 ).json( { message: errorMsg } );

    const current_office = office || active_office;

    // Check user exists
    const [existingUser] = await pool.query( "SELECT id FROM users WHERE user_login_id = ?", [userid] );
    if ( existingUser.length === 0 ) return res.status( 400 ).json( { message: "यो प्रयोगकर्ता अवस्थित छैन।" } );

    const hashedPassword = await hashPassword( password );

    const sql = `
      UPDATE users
      SET user_name=?, role_id=?, password=?, office_id=?, branch_id=?, is_active=?
      WHERE user_login_id=?
    `;
    const [result] = await pool.query( sql, [name_np, userrole, hashedPassword, current_office, branch, is_active, userid] );

    return res.json( { Status: true, Result: result } );
  } catch ( error ) {
    console.error( "Update user error:", error );
    return res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
  }
} );

// Reset Password
router.put( '/reset_password', verifyToken, authLimiter, async ( req, res ) => {
  const active_user = req.user.id;
  const { old_password, password, repassword } = req.body;

  const errorMsg = validateUserFields( { username: 'dummy', password, repassword, name_np: 'dummy' } );
  if ( !old_password ) return res.status( 400 ).json( { message: "पुरानो पासवर्ड आवश्यक छ।" } );
  if ( errorMsg ) return res.status( 400 ).json( { message: errorMsg } );

  try {
    const [userResult] = await pool.query( "SELECT * FROM users WHERE id = ?", [active_user] );
    if ( userResult.length === 0 ) return res.status( 401 ).json( { loginStatus: false, message: "Invalid user" } );

    const user = userResult[0];
    const matchOld = await comparePassword( old_password, user.password );
    if ( !matchOld ) return res.status( 401 ).json( { loginStatus: false, message: "पुरानो पासवर्ड मिलेन" } );
    if ( old_password === password ) return res.status( 400 ).json( { message: "पुरानो र नयाँ पासवर्ड उस्तै छन्।" } );

    const hashedPassword = await hashPassword( password );
    const [result] = await pool.query( "UPDATE users SET password=?, must_change_password=0 WHERE id=?", [hashedPassword, active_user] );

    return res.json( { Status: true, Result: result } );
  } catch ( error ) {
    console.error( "Reset password error:", error );
    return res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
  }
} );

// Login Route
router.post( '/login', authLimiter, async ( req, res ) => {
  const { username, password } = req.body;

  if ( !username || !password ) {
    return res.status( 400 ).json( { loginStatus: false, Error: "Username and Password are required." } );
  }

  try {
    const [userResult] = await pool.query( `
            SELECT u.*, o.office_name_with_letter_address AS office_np, o.letter_address AS office_en,
                   nd.district_name_np, ur.id AS role_id, ur.role_name, b.branch_np,
                   ut.usertype_en, ut.usertype_np
            FROM users u
            LEFT JOIN offices o ON u.office_id = o.id
            LEFT JOIN np_district nd ON o.district_Id = nd.did
            LEFT JOIN branch b ON u.branch_id = b.id
            LEFT JOIN usertypes ut ON u.usertype = ut.id
            LEFT JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.user_login_id = ?`, [username] );

    if ( userResult.length === 0 ) {
      return res.status( 401 ).json( { loginStatus: false, Error: "Invalid username or password" } );
    }

    const user = userResult[0];
    const isMatch = await bcrypt.compare( password, user.password );
    if ( !isMatch ) {
      return res.status( 401 ).json( { loginStatus: false, Error: "Invalid username or password" } );
    }

    const userdetails = {
      id: user.id,
      name_en: user.user_name,
      username: user.user_login_id,
      email: user.email,
      user_permission: user.user_permission,
      is_active: user.is_active,
      is_online: 1,
      office_id: user.office_id,
      office_np: user.office_np,
      office_en: user.office_en,
      office_district: user.district_name_np,
      branch_name: user.branch_np,
      usertype_en: user.usertype_en,
      usertype_np: user.usertype_np,
      role_id: user.role_id,
      role_name: user.role_name
    };

    const token = jwt.sign( userdetails, process.env.JWT_SECRET, { expiresIn: '1h' } );

    res.cookie( 'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.dopm.gov.np' : 'localhost',  // ✅ prod: allow subdomains, dev: auto
    } );


    req.session.user = { userdetails };

    // Update online status
    await pool.query( "UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?", [user.id] );

    return res.json( {
      loginStatus: true,
      userdetails,
      must_change_password: user.must_change_password
    } );

  } catch ( err ) {
    console.error( "Login error:", err );
    return res.status( 500 ).json( { loginStatus: false, Error: "Server error" } );
  }
} );

// GET /auth/get_menus
router.get("/get_menus", verifyToken, async (req, res) => {
  const role_id = req.user?.role_id;
  try {
    const [rows] = await pool.query(
      `SELECT m.id, m.title, m.link, m.icon, m.parent_id 
       FROM menus m
       JOIN menus_role mr ON m.id=mr.menu_id
       WHERE mr.role_id=?
       ORDER BY m.parent_id, m.order_no ASC`,[role_id]
    );

    // Convert flat list to nested structure
    const menuMap = {};
    const topMenus = [];

    rows.forEach((menu) => {
      menu.children = [];
      menuMap[menu.id] = menu;

      if (!menu.parent_id) topMenus.push(menu);
      else if (menuMap[menu.parent_id]) menuMap[menu.parent_id].children.push(menu);
    });
    // console.log(topMenus)
    res.json(topMenus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch menus" });
  }
});

// Logout
router.post( '/logout', verifyToken, async ( req, res ) => {
  const user_id = req.user?.id;
  if ( !user_id ) return res.status( 401 ).json( { success: false, message: 'Unauthorized' } );

  try {
    await pool.query( "UPDATE users SET is_online=0 WHERE id=?", [user_id] );

    res.clearCookie( 'token', { httpOnly: true, sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' } );
    const isProd = process.env.NODE_ENV === 'production'
    res.clearCookie( 'token', {
      httpOnly: true,
      sameSite: isProd ? 'None' : 'Lax',
      secure: isProd,
      domain: isProd ? '.dopm.gov.np' : 'localhost'
    } );

    const destroyAsync = promisify( req.session.destroy ).bind( req.session );
    await destroyAsync();

    return res.status( 200 ).json( { success: true, message: 'Logout successful' } );
  } catch ( error ) {
    console.error( "Logout error:", error );
    return res.status( 500 ).json( { success: false, message: 'Logout failed' } );
  }
} );

// Online Status
router.get( '/get_online_status', verifyToken, async ( req, res ) => {
  try {
    const [result] = await pool.query( `
      SELECT o.id AS office_id, o.letter_address AS office_name, MAX(u.is_online) AS is_online
      FROM offices o
      LEFT JOIN users u ON o.id = u.office_id
      WHERE o.office_categories_id IN (2,3)
      GROUP BY o.id
    `);
    return res.json( { success: true, data: result } );
  } catch ( error ) {
    console.error( "Online status fetch error:", error );
    return res.status( 500 ).json( { success: false, message: 'Failed to fetch online status' } );
  }
} );

// Login Ping
router.post( '/login_ping', verifyToken, async ( req, res ) => {
  const user_id = req.user?.id;
  if ( !user_id ) return res.status( 401 ).json( { success: false, message: 'Unauthorized' } );

  try {
    await pool.query( "UPDATE users SET is_online=1, last_seen=NOW() WHERE id=?", [user_id] );
    return res.json( { success: true } );
  } catch ( error ) {
    console.error( "Login ping error:", error );
    return res.status( 500 ).json( { success: false } );
  }
} );

// Session Validation
router.get( '/session', verifyToken, async ( req, res ) => {
  res.json( { loggedIn: true, user: req.user } );
} );


// Health Check
router.get( '/health', async ( req, res ) => {
  try {
    await pool.query( "SELECT 1" );
    res.status( 200 ).send( "OK" );
  } catch ( error ) {
    res.status( 500 ).send( "DB Connection Failed" );
  }
} );
export { router as authRouter };