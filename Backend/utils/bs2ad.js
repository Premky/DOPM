import NepaliDate from 'nepali-datetime';
import dateConverter from 'nepali-datetime/dateConverter';

export async function bs2ad1( date ) {
    const bsdob = new NepaliDate( date );
    // console.log(bsdob)
    const addob = bsdob.formatEnglishDate( 'YYYY-MM-DD' );
    // console.log(date)
    // console.log(addob)
    return addob;
}

export default function isValidDate( dateString ) {
    const [year, month, day] = dateString.split( '-' ).map( Number );
    if (
        year < 1000 || year > 9999 ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
    ) return false;

    const date = new Date( year, month - 1, day );
    return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
    );
}

export async function bs2ad( bsDateStr ) {
    try {
        const [year, month, day] = bsDateStr.split( "-" ).map( Number );

        if ( year < 2000 || year > 2090 || month < 1 || month > 12 || day < 1 || day > 32 ) {
            throw new Error( "Invalid BS date range" );
        }

        // month should NOT have +1 here
        const date = dateConverter.nepaliToEnglish( year, month, day );

        // date is an array like [YYYY, MM, DD]
        const adDate = new Date( date[0], date[1] - 1, date[2] );

        console.log( "Date:", adDate );
        console.log( "UTC Date:", adDate.getUTCDate() );
        // console.log( "Local Date:", adDate.getDate() );

        console.log( "Date:", adDate.getDate() );

        adDate.setHours( 0, 0, 0, 0 );
        const dateStr = `${ adDate.getFullYear() }-${ String( adDate.getMonth() + 1 ).padStart( 2, '0' ) }-${ String( adDate.getDate() ).padStart( 2, '0' ) }`;
        const dateUTCStr = `${ adDate.getUTCFullYear() }-${ String( adDate.getUTCMonth() + 1 ).padStart( 2, '0' ) }-${ String( adDate.getUTCDate() ).padStart( 2, '0' ) }`;        
        return dateUTCStr;
    } catch ( err ) {
        console.warn( `⚠️ Skipping invalid BS date: ${ bsDateStr } (${ err.message })` );
        return null;
    }
}





export async function bs2ad3( bsDateStr ) {
    try {
        const [year, month, day] = bsDateStr.split( "-" ).map( Number );

        // Validate year range for nepali-datetime
        if ( year < 2000 || year > 2090 || month < 1 || month > 12 || day < 1 || day > 32 ) {
            throw new Error( "Invalid BS date range" );
        }

        const date = new NepaliDate( year, month - 1, day );
        return `${ date.getFullYear() }-${ String( date.getMonth() + 1 ).padStart( 2, "0" ) }-${ String( date.getDate() ).padStart( 2, "0" ) }`;
    } catch ( err ) {
        console.warn( `⚠️ Skipping invalid BS date: ${ bsDateStr } (${ err.message })` );
        return null; // Return null so you can skip updating
    }
}