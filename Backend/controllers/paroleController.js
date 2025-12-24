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
    const id = req.params.id;
    const result = await paroleService.updateParoleNos( req.body, active_user, id );
    res.status( 200 ).json( { Status: true, message: "प्यारोल बैठक विवरण अध्यावधिक भयो ।", result } );
  } catch ( err ) {
    console.log( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to update" } );
  }
};

export const deleteParoleNos = async ( req, res ) => {
  try {
    const active_user = req.user?.username;
    console.log( "Trying to delete" );
    res.status( 200 ).json( { Status: true, message: 'Deleted' } );
  } catch ( err ) {
    console.log( err );
    res.status( 500 ).json( { Status: false, message: err.message, error: "Failed to Delete" } );
  }
};

export const updateCourtDecision = async ( req, res ) => {
  const { parole_id } = req.params;
  const userId = req.user.username;
  const currentOffice = req.user.office_id;
  const data = req.body;

  try {
    await paroleService.saveCourtDecisionService( {
      parole_id, data, userId, currentOffice
    } );

    res.json( {
      success: true,
      message: "अदालतको निर्णय अपडेट भयो ।"
    } );
  } catch(error) {
    console.error(error);
    res.status(500).json({
      success:false,
      message:"अदालतको निर्णय अपडेट गर्न सकिएन ।"
    })
  }

};