import NepaliDate from "nepali-datetime";
import dateConverter from "nepali-datetime/dateConverter";

import {adToBs, bsToAd, calculateAge} from '@sbmdkl/nepali-date-converter'

export async function bs2ad( bsDateStr ) {
    let dateUTCStr
    try {
        const [year, month, day] = bsDateStr.split( "-" ).map( Number );

        if ( year < 2000 || year > 2090 || month < 1 || month >= 12 || day < 1 || day > 32 ) {
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


export async function bs2ad1212(bsDateStr) {
    try {
	const bsDate = adToBs('2078-03-05');
	console.log(bsDate);
	// to calculate age
	const myAge = calculateAge('2070-10-10');
	console.log(myAge);
    const adDate = bsToAd(bsDateStr);
    console.log(adDate);
} catch (e) {
	console.log(e.message);
}
}



export async function bs2ad222(bsDateStr) {
  try {
    const [year, month, day] = bsDateStr.split("-").map(Number);

    if (year < 2000 || year > 2090 || month < 1 || month > 12 || day < 1 || day >32) {
      throw new Error("Invalid BS date range");
    }

    // 👉 your version returns [YYYY, MM, DD]
    const dateArr = dateConverter.nepaliToEnglish(year, month, day);
    console.log("Converted date:", dateArr);

    if (!Array.isArray(dateArr) || dateArr.length !== 3) {
      throw new Error("Conversion failed");
    }

    const [adYear, adMonth, adDay] = dateArr;

    // Build date safely
    const adDate = new Date(adYear, adMonth - 1, adDay);
    adDate.setHours(0, 0, 0, 0);

    // Format YYYY-MM-DD
    return `${adDate.getFullYear()}-${String(adDate.getMonth() + 1).padStart(2, "0")}-${String(adDate.getDate()).padStart(2, "0")}`;

  } catch (err) {
    console.warn(`⚠️ Skipping invalid BS date: ${bsDateStr} (${err.message})`);
    return null;
  }
}









export async function bs2ad00( date ) {
    const bsdob = new NepaliDate( date );
    // console.log(bsdob)
    const addob = bsdob.formatEnglishDate( 'YYYY-MM-DD' );
    // console.log(date)
    // console.log(addob)
    return addob;
}
