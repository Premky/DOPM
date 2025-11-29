import pool from "../utils/db3.js";

export const verifyPermission = ( module, action ) => {
    return async ( req, res, next ) => {
        try {
            const userId = req.user?.id;
            if ( !userId ) return res.status( 401 ).json( { message: "Unauthorized" } );

            const roleId = req.user?.role_id;
            // Get Permissions for this module+action
            const [permRows] = await pool.query(
                `SELECT id FROM permissions WHERE module_name=? AND action=?`, [module, action]
            );

            if ( !permRows.length )
                return res.status( 403 ).json( { message: "Permissions not found" } );

            const permissionId = permRows[0].id;

            //Checking if user has this permission:
            const [userPermRows] = await pool.query(
                `SELECT * FROM permissions_user WHERE user_id=? AND permission_id=?`,
                [userId, permissionId]
            );
            if ( userPermRows.length ) {
                return next();
            }

            //Checking if role has this permission:
            const [rolePermRows] = await pool.query(
                `SELECT * FROM permissions_role WHERE role_id=? AND permission_id=?`,
                [roleId, permissionId]
            );
            if(rolePermRows.length){
                return next();
            }

            //If neither of them has permission. 
            return res.status( 403 ).json( { message: "Forbidden: Permission denied" } );

            next();
        } catch ( err ) {
            console.error( err );
            res.status( 500 ).json( { message: "Internal Server Error" } );
        }
    };
};