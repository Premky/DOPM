import express from 'express';
import con, { promiseCon } from '../utils/db.js';
import pool from '../utils/db3.js'

import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import session from 'express-session';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

const queryAsync = promisify( con.query ).bind( con );
const beginTransactionAsync = promisify( con.beginTransaction ).bind( con );
const commitAsync = promisify( con.commit ).bind( con );
const rollbackAsync = promisify( con.rollback ).bind( con );
const query = promisify( con.query ).bind( con );

// Function to hash passwords
const hashPassword = async ( password ) => {
    const salt = await bcrypt.genSalt( 10 );
    return await bcrypt.hash( password, salt );
};

// Validate Login Input
const validateLoginInput = ( username, password ) => {
    if ( !username || !password ) {
        return { isValid: false, message: "Username and Password are required." };
    }
    return { isValid: true };
};

// Create User Route
router.post( "/create_user", async ( req, res ) => {
    try {
        const { name_np, username, usertype, password, repassword, office, branch, is_active } = req.body;

        if ( !name_np || !username || !password || !repassword || !office ) {
            return res.status( 400 ).json( { message: "सबै फिल्डहरू आवश्यक छन्।" } );
        }

        if ( password !== repassword ) {
            return res.status( 400 ).json( { message: "पासवर्डहरू मिलेन।" } );
        }

        const existingUser = await query( "SELECT id FROM users WHERE user_login_id = ?", [username] );
        if ( existingUser.length > 0 ) {
            return res.status( 400 ).json( { message: "यो प्रयोगकर्ता नाम पहिल्यै अवस्थित छ।" } );
        }

        const hashedPassword = await hashPassword( password );
        const sql = `
            INSERT INTO users (user_name, user_login_id, usertype, password, office_id, branch_id, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        try {
            const result = await query( sql, [name_np, username, usertype, hashedPassword, office, branch, is_active] );
            return res.json( { Status: true, Result: result } );
        } catch ( err ) {
            console.error( "Database Query Error:", err );
            res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
        }
    } catch ( error ) {
        console.error( "User creation error:", error );
        res.status( 500 ).json( { message: "सर्भर त्रुटि भयो।" } );
    }
} );

// Get Users Route
router.get( '/get_users', async ( req, res ) => {
    const sql = `SELECT 
            u.*, 
            ut.usertype_en, 
            o.office_name_with_letter_address, 
            b.branch_np
        FROM 
            users u
        LEFT JOIN 
            usertypes ut ON u.usertype = ut.id
        LEFT JOIN 
            offices o ON u.office_id = o.id
        LEFT JOIN 
            branch b ON u.branch_id = b.id
        ORDER BY 
            u.id`;

    try {
        const result = await query( sql );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

// Update User Route
router.put( '/update_user/:userid', verifyToken, async ( req, res ) => {
    const { userid } = req.params;
    // console.log(req.body);
    const { name_np, username, usertype, password, repassword, office, branch, is_active } = req.body;

    if ( !username || !name_np || !password || !repassword || !office ) {
        return res.status( 400 ).json( { message: "सबै फिल्डहरू आवश्यक छन्।" } );
    }

    if ( password !== repassword ) {
        return res.status( 400 ).json( { message: "पासवर्डहरू मिलेन।" } );
    }

    const existingUser = await query( "SELECT id FROM users WHERE user_login_id = ?", [userid] );
    if ( existingUser.length === 0 ) {
        return res.status( 400 ).json( { message: "यो प्रयोगकर्ता अवस्थित छैन।" } );
    }

    const hashedPassword = await hashPassword( password );
    const sql = `
        UPDATE users SET user_name=?, user_login_id=?, usertype=?, password=?, office_id=?, branch_id=?, is_active=? WHERE user_login_id=?`;

    try {
        const result = await query( sql, [name_np, username, usertype, hashedPassword, office, branch, is_active, userid] );
        return res.json( { Status: true, Result: result } );
    } catch ( err ) {
        console.error( "Database Query Error:", err );
        res.status( 500 ).json( { Status: false, Error: "Internal Server Error" } );
    }
} );

// Delete User Route
router.delete( '/delete_user/:id', async ( req, res ) => {
    const { id } = req.params;

    if ( !Number.isInteger( parseInt( id ) ) ) {
        return res.status( 400 ).json( { Status: false, Error: 'Invalid ID format' } );
    }

    try {
        const sql = "DELETE FROM users WHERE id = ?";
        con.query( sql, id, ( err, result ) => {
            if ( err ) {
                console.error( 'Database query error:', err );
                return res.status( 500 ).json( { Status: false, Error: 'Internal server error' } );
            }

            if ( result.affectedRows === 0 ) {
                return res.status( 404 ).json( { Status: false, Error: 'Record not found' } );
            }

            return res.status( 200 ).json( { Status: true, Result: result } );
        } );
    } catch ( error ) {
        console.error( 'Unexpected error:', error );
        return res.status( 500 ).json( { Status: false, Error: 'Unexpected error occurred' } );
    }
} );

// Login Route
router.post( '/login1', async ( req, res ) => {
    const { username, password } = req.body;
    // console.log(req.body)
    const validation = validateLoginInput( username, password );
    console.log( username );
    if ( !validation.isValid ) {
        return res.status( 400 ).json( { loginStatus: false, Error: validation.message } );
    }

    const fetchUserQuery = `
        SELECT DISTINCT u.*,
                        o.office_name_with_letter_address AS office_np, o.office_name_eng AS office_en,                     
                        o.id AS office_id, ut.usertype_en, ut.usertype_np
                        FROM users u
                        LEFT JOIN offices o ON u.office_id = o.id
                        LEFT JOIN usertypes ut ON u.usertype=ut.id    
                        WHERE u.user_login_id = ?`;
    // , b.name_np AS branch_name
    // LEFT JOIN branch b ON u.branch_id = b.id

    try {
        con.query( fetchUserQuery, [username], async ( err, result ) => {
            if ( err ) {
                console.error( "Database error:", err );
                return res.status( 500 ).json( { loginStatus: false, Error: "Database error" } );
            }

            if ( result.length === 0 ) {
                return res.status( 401 ).json( { loginStatus: false, Error: "Invalid username or password" } );
            }

            const user = result[0];
            const isMatch = await bcrypt.compare( password, user.password );
            if ( !isMatch ) {
                return res.status( 401 ).json( { loginStatus: false, Error: "Invalid username or password" } );
            }

            // console.log('user', user)

            const userdetails = {
                id: user.id,
                name_en: user.user_name,
                username: user.user_login_id,
                email: user.email,
                user_permission: user.user_permission,
                is_staff: user.is_staff,
                is_active: user.is_active,
                is_online: 1,
                is_superuser: user.issuperuser,
                last_login: user.last_login,
                join_date: user.join_date,
                office_id: user.office_id,
                office_np: user.office_np,
                office_en: user.office_en,
                branch_name: user.branch_name,
                usertype_en: user.usertype_en,
                usertype_np: user.usertype_np
            };

            const token = jwt.sign( userdetails, process.env.JWT_SECRET, { expiresIn: '1h' } );

            // res.cookie('token', token, {
            //     httpOnly: true,
            //     secure: process.env.NODE_ENV === 'production' && !process.env.DISABLE_SECURE_COOKIES,
            //     sameSite: 'strict',
            //     path: '/',
            //     maxAge: 86400000
            // });
            res.cookie( 'token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // only over HTTPS
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // needed for cross-site cookies
                maxAge: 60 * 60 * 1000,
            } );

            req.session.user = { userdetails };

            // After token is generated and before res.json()
            await con.query( "UPDATE users SET is_online = 1 WHERE id = ?", [user.id] );

            return res.json( {
                loginStatus: true,
                userdetails: userdetails,
            } );
        } );

    } catch ( err ) {
        console.error( "Unexpected error:", err );
        return res.status( 500 ).json( { loginStatus: false, Error: "Server error" } );
    }
} );

router.post( '/login', async ( req, res ) => {
    const { username, password } = req.body;
    const validation = validateLoginInput( username, password );

    if ( !validation.isValid ) {
        return res.status( 400 ).json( { loginStatus: false, Error: validation.message } );
    }

    const fetchUserQuery = `
    SELECT DISTINCT u.*,
      o.office_name_with_letter_address AS office_np, o.office_name_eng AS office_en,
      o.id AS office_id, ut.usertype_en, ut.usertype_np
    FROM users u
    LEFT JOIN offices o ON u.office_id = o.id
    LEFT JOIN usertypes ut ON u.usertype = ut.id
    WHERE u.user_login_id = ?`;

    try {
        // Use promise-based query
        const [result] = await pool.query( fetchUserQuery, [username] );

        if ( result.length === 0 ) {
            return res.status( 401 ).json( { loginStatus: false, Error: "Invalid username or password" } );
        }

        const user = result[0];

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
            is_staff: user.is_staff,
            is_active: user.is_active,
            is_online: 1,
            is_superuser: user.issuperuser,
            last_login: user.last_login,
            join_date: user.join_date,
            office_id: user.office_id,
            office_np: user.office_np,
            office_en: user.office_en,
            branch_name: user.branch_name,
            usertype_en: user.usertype_en,
            usertype_np: user.usertype_np
        };

        const token = jwt.sign( userdetails, process.env.JWT_SECRET, { expiresIn: '1h' } );

        res.cookie( 'token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 60 * 60 * 1000,
        } );

        req.session.user = { userdetails };

        // Update online status
        // await promiseCon.query("UPDATE users SET is_online = 1 WHERE id = ?", [user.id]);
        await pool.query( "UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?", [user.id] );

        return res.json( {
            loginStatus: true,
            userdetails,
        } );

    } catch ( err ) {
        console.error( "Unexpected error:", err );
        return res.status( 500 ).json( { loginStatus: false, Error: "Server error" } );
    }
} );

// Logout Route
// Include this middleware if you're using JWT to extract req.user
router.post( '/logout', verifyToken, async ( req, res ) => {
    if ( !req.user || !req.user.id ) {
        return res.status( 401 ).json( { success: false, message: 'Unauthorized' } );
    }

    const user_id = req.user.id;

    try {
        await pool.query( "UPDATE users SET is_online = 0 WHERE id = ?", [user_id] );

        res.clearCookie( 'token', {
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production',
        } );

        return res.status( 200 ).json( { success: true, message: 'Logout successful' } );
    } catch ( error ) {
        console.error( 'Logout error:', error );
        return res.status( 500 ).json( { success: false, message: 'Logout failed' } );
    }
} );



router.post( '/logout1', verifyToken, async ( req, res ) => {
    const user_id = req.user.id;
    console.log( `User ${ req.user.user_name } Logged Out.` );

    try {
        // Update is_online status
        await con.query( "UPDATE users SET is_online = 0 WHERE id = ?", [user_id] );
        console.log( 'is_online_test' );

        // Destroy session if using express-session
        // req.session.destroy((err) => {
        //     if (err) console.error("Session destroy error:", err);
        // });

        // Clear JWT cookie
        res.clearCookie( 'token', {
            httpOnly: true,
            sameSite: 'Lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0,
        } );

        return res.status( 200 ).json( { success: true, message: 'Logout successful' } );
    } catch ( error ) {
        return res.status( 500 ).json( { success: false, message: 'Logout failed' } );
    }
} );

router.get( '/get_online_status', verifyToken, async ( req, res ) => {
    try {
        const sql = `
      SELECT o.id AS office_id, o.letter_address AS office_name, MAX(u.is_online) AS is_online
      FROM offices o
      LEFT JOIN users u ON o.id = u.office_id
      WHERE o.office_categories_id= 2 OR office_categories_id=3
      GROUP BY o.id
    `;
        const [result] = await pool.query(sql)

        res.json( { success: true, data: result } );
    } catch ( err ) {
        console.error( 'Online status fetch error:', err );
        res.status( 500 ).json( { success: false, message: 'Failed to fetch online status' } );
    }
} );

router.post('/login_ping', verifyToken, async (req, res) => {
    const active_office = req.user.office_id;
    const user_id = req.user.id;

    // Corrected logic
    // if (active_office !== 1 && active_office !== 2) return;
    try {
        await pool.query(
            "UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?",
            [user_id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Ping error:", error);
        res.status(500).json({ success: false });
    }
});

// Session Validation Route
router.get( '/session', verifyToken, ( req, res ) => {
    // console.log('session', req.user)
    if ( !req.user ) return res.status( 401 ).json( { loggedIn: false } );

    const { name_en, username, email, is_staff, is_active, is_online, last_login, join_date, office_id, office_np, office_en, usertype_en, usertype_np } = req.user;

    return res.json( {
        loggedIn: true,
        user: {
            name_en,
            username,
            email,
            is_staff,
            is_active,
            is_online,
            last_login,
            join_date,
            office_id, office_np, office_en,
            usertype_en, usertype_np
        }
    } );
} );

// Health Check Route
router.get( '/health', ( req, res ) => {
    res.status( 200 ).send( "OK" );
} );

export { router as authRouter };
