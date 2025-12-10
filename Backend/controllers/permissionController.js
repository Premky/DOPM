import * as permissionService from "../services/permissionService.js";

export const getModules = async ( req, res ) => {
  try {
    const result = await permissionService.getModules();
    res.status( 200 ).json( { Status: true, result, message: "Modules fetched successfully" } );
  } catch ( error ) {
    console.error( error );
    res.status( 500 ).json( { Status: false, error: "Failed to fetch modules" } );
  }
};

//Create Permission
export const createPermission = async ( req, res ) => {
  try {
    const result = await permissionService.createPermission( req.body );
    res.status( 200 ).json( { Status: true, result, message: "Permission created" } );
  } catch ( error ) {
    res.status( 500 ).json( { Status: false, error: error.message } );
  }
};

//Delete Permission
export const deletePermission = async ( req, res ) => {
  try {
    await permissionService.deletePermission( req.params.id );
    req.status( 200 ).json( { Status: true, message: "Permission deleted" } );
  } catch ( error ) {
    res.status( 500 ).json( { Status: false, error: error.message } );
  }
};

// Assign Permission to Role
export const assignRolePermissions = async ( req, res ) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body; // array of permissions

    await permissionService.assignRolePermissions( roleId, permissionIds );
    res.status( 200 ).json( { Status: true, message: "Permissions assigned to role" } );
  } catch ( error ) {
    res.status( 500 ).json( { Status: false, error: error.message } );
  }
};

//Revoke Role Permission
export const revokeRolePermission = async ( req, res ) => {
  try {
    const { roleId, permissionId } = req.params;
    await permissionService.revokeRolePermission( roleId, permissionId );

    res.status( 200 ).json( { Status: true, message: "Permission revoked from role" } );
  } catch ( error ) {
    res.status( 500 ).json( { Status: false, error: error.message } );
  }
};

// User Permissions
export const assignUserPermissions = async ( req, res ) => {
  try {
    const { userId } = req.params;
    const { permissionIds } = req.body;

    await permissionService.assignUserPermissions( userId, permissionIds );
    res.status( 200 ).json( { Status: true, message: "Permissions assigned to user" } );
  } catch ( error ) {
    res.status( 500 ).json( { Status: false, error: error.message } );
  }
};

export const revokeUserPermission = async ( req, res ) => {
  try {
    const { userId, permissionId } = req.params;
    await permissionService.revokeUserPermission( userId, permissionId );

    res.status( 200 ).json( { Status: true, message: "Permission revoked from user" } );
  } catch ( error ) {
    res.status( 500 ).json( { Status: false, error: error.message } );
  }
};

export const getUserPermissions=async(req, res)=>{
  try{
    const {userId}=req.params;
    const result = await permissionService.getUserPermissions(userId);

    res.status(200).json({Status:true, result});
  }catch(error){
    res.status(500).json({Status:false, error:error.message});
  }
}

export const getPermissions = async ( req, res ) => {
  try {
    const result = await permissionService.getPermissions();
    res.status( 200 ).json( { Status: true, result, message: "Permissions fetched successfully" } );
  } catch ( error ) {
    console.error( error );
    res.status( 500 ).json( { Status: false, error: "Failed to fetch permissions" } );
  }
};

export const getRoles = async ( req, res ) => {
  try {
    const result = await permissionService.getRoles();
    res.status( 200 ).json( { Status: true, result, message: "Roles fetched successfully" } );
  } catch ( error ) {
    console.error( error );
    res.status( 500 ).json( { Status: false, error: "Failed to fetch roles" } );
  }
};
