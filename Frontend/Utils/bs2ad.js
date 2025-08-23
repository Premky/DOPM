import NepaliDate from "nepali-datetime";
import dateConverter from "nepali-datetime/dateConverter";

export async function bs2ad(bsDateStr) {
  try {
    const [year, month, day] = bsDateStr.split("-").map(Number);

    // Basic validation
    if (!year || !month || !day) {
      throw new Error("Invalid BS date format");
    }
    if (month < 1 || month > 12 || day < 1 || day > 32) {
      throw new Error(`Invalid BS date range: ${bsDateStr}`);
    }

    // Convert using NepaliDate
    const bsDate = new NepaliDate(bsDateStr);
    const adDate = bsDate.formatEnglishDate("YYYY-MM-DD");

    console.log("Converted AD Date:", bsDateStr, "==>", adDate);
    return adDate;
  } catch (err) {
    console.warn(`⚠️ Skipping invalid BS date: ${bsDateStr} (${err.message})`);
    return null;
  }
}


export async function bs2ad1( bsDateStr ) {
  let dateUTCStr;
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
    dateUTCStr = `${ adDate.getUTCFullYear() }-${ String( adDate.getUTCMonth() + 1 ).padStart( 2, '0' ) }-${ String( adDate.getUTCDate() ).padStart( 2, '0' ) }`;
    return dateUTCStr;
  } catch ( err ) {
    console.warn( `⚠️ Skipping invalid BS date: ${ bsDateStr } -> ${ dateUTCStr } (${ err.message })` );
    return null;
  }
}
