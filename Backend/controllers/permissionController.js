import * as permissionService from '../services/permissionService.js'

export const getModules = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    const result = await permissionService.getModules();
    res.status(200).json({Status:true, result, message:"Record Found"})
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { Status: true, message: "Result Fetched Successfully", result } );
  }
};

export const getPermissions=async(req,res)=>{
  try{
    const active_user=req.user?.username;
    const result = await permissionService.getPermissions();
  }catch(error){
    res.status(500).json({Status:true, message:"Result Fetched Successfully", result});
  }
}