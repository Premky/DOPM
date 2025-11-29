import * as paroleService from "../services/paroleService.js";

export const getParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    const result = await paroleService.getParoleNos();
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { Status: true, message: "Result Fetched Successfully", result } );
  }
};

export const createParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    const result = await paroleService.createParoleNos( req.body, active_user );
    res.status( 200 ).json( { Status: true, message: "प्यारोल नं. Created Successfully", result } );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to create menu" } );
  }
};

export const updateParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;

  } catch ( err ) {
    console.log( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to update" } );
  }
};

export const deleteParoleNos=async(req,res)=>{
  try{
    const active_user = req.user?.username;

  }catch(err){
    console.log(err);
    res.status(500).json({Status: false, message:err.message, error:"Failed to Delete"});
  }
}