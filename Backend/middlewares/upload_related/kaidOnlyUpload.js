import multer from "multer";
import path from "path";

const storage = multer.diskStorage( {
    destination: ( req, file, cb ) => {
        cb( null, "uploads/kaid_pdfs" );
    },
    filename: ( req, file, cb ) => {
        const ext = path.extname( file.originalname );
        const officeBandiId = req.body?.office_bandi_id
            ? String( req.body.office_bandi_id ).replace( /[^0-9A-Za-z_-]/g, "" ) : "unknown";
        const timestamp = Date.now();
        cb( null, `kaid_purji_pdf_${ officeBandiId }_${ timestamp }${ ext }` );
    }
} );

const fileFilter = ( req, file, cb ) => {
    if ( file.mimetype === "application/pdf" ) {
        cb( null, true );
    } else {
        cb( new Error( "Only PDF files are allowed" ), false );
    }
};

export const kaidUpload = multer( {
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
} );

