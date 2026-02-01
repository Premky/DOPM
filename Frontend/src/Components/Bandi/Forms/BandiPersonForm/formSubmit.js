import axios from "axios";

/* ---------------------------------------
   Build FormData for create/update
----------------------------------------*/
export const buildFormData = ( data ) => {
    const formData = new FormData();

    Object.entries( data ).forEach( ( [key, value] ) => {
        if ( value === undefined || value === null ) return;

        // ✅ Handle files explicitly
        if ( key === "bandi_photo" || key === "kaid_pdf" ) {
            if ( value instanceof File ) {
                formData.append( key, value );
            } else if ( Array.isArray( value ) && value[0] instanceof File ) {
                // just in case it's an array
                formData.append( key, value[0] );
            }
            return;
        }

        // ✅ Objects or arrays → JSON string
        if ( Array.isArray( value ) || typeof value === "object" ) {
            formData.append( key, JSON.stringify( value ) );
            return;
        }

        // ✅ Primitive values
        formData.append( key, value );
    } );

    return formData;
};

/* ---------------------------------------
   Submit function
----------------------------------------*/
export const submitBandiPersonForm = async ( {
    data,
    BASE_URL,
    editing = false,
    navigate,
    reset
} ) => {
    try {
        const url = editing
            ? `${ BASE_URL }/bandi/update_bandi/${ data.bandi_id || data._id }`
            : `${ BASE_URL }/bandi/create_bandi`;

        const formData = buildFormData( data );

        // 🔹 Debug: log FormData entries
        for ( const pair of formData.entries() ) {
            console.log( pair[0], pair[1] );
        }

        const response = await axios.post( url, formData, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data", // important!
            },
        } );

        // optional: reset form or navigate
        // if ( !editing && reset ) reset();
        if ( navigate && response.data.Status ) {
            // navigate( `/bandi/view_saved_record/${ response.data.Result }/${ response.data.office_bandi_id }` );
            alert('recorded')
        }

        return response.data;
    } catch ( error ) {
        console.error( "❌ submitBandiPersonForm error:", error );
        throw error;
    }
};
