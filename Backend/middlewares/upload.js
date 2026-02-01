import multer from "multer";
import path from "path";
import fs from "fs";

/* ------------------ Ensure directory ------------------ */
const ensureDir = ( dir ) => {
  if ( !fs.existsSync( dir ) ) {
    fs.mkdirSync( dir, { recursive: true } );
  }
};

/* ------------------ Unified Storage ------------------ */
const storage = multer.diskStorage( {
  destination: ( req, file, cb ) => {
    let dir = "uploads/others";

    if ( file.fieldname === "bandi_photo" ) {
      dir = "uploads/bandi_photos";
    }

    if ( file.fieldname === "kaid_pdf" ) {
      dir = "uploads/kaid_pdfs";
    }

    ensureDir( dir );
    cb( null, dir );
  },

  filename: ( req, file, cb ) => {
    const ext = path.extname( file.originalname );

    //First get office_bandi_id
    const officeBandiId = req.body?.office_bandi_id
      ? String( req.body.office_bandi_id ).replace( /[^0-9A-Za-z_-]/g, "" ) : "unknown";
    const timestamp = Date.now();


    if ( file.fieldname === "bandi_photo" ) {
      return cb( null, `bandi_${ officeBandiId }_${ timestamp }${ ext }` );
    }

    if ( file.fieldname === "kaid_pdf" ) {
      return cb( null, `kaid_purji_pdf_${ officeBandiId }_${ timestamp }${ ext }` );
    }

    cb( null, `${ officeBandiId }_${ timestamp }${ ext }` );
  },
} );

/* ------------------ File Filter ------------------ */
const fileFilter = ( req, file, cb ) => {
  if (
    file.fieldname === "bandi_photo" &&
    file.mimetype.startsWith( "image/" )
  ) {
    return cb( null, true );
  }

  if (
    file.fieldname === "kaid_pdf" &&
    file.mimetype === "application/pdf"
  ) {
    return cb( null, true );
  }

  cb( new Error( "Invalid file type" ) );
};

/* ------------------ Export uploader ------------------ */
export const bandiUpload = multer( {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB safety
  },
} );
