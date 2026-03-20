import NepaliDate from "nepali-datetime";

/**
 * Convert days to Y/M/D using system rule
 * 1 year = 365 days
 * 1 month = 30 days
 */
export function convertDaysToYMDUpdated( days = 0 ) {
  let remainingDays = days;
  const gapDays = Math.ceil( remainingDays / 73 ); // 73-day gap
  // const gapDays =   remainingDays / 73; // 90-day gap
  // console.log( `Gap days: ${ gapDays }` );
  remainingDays -= gapDays; // Remove gap days from remaining days

  let years = Math.floor( remainingDays / 365 );
  remainingDays = remainingDays % 365;


  let months = Math.floor( remainingDays / 30 );
  const d = remainingDays % 30;

  if ( months == 12 ) {
    years = years + 1;
    months = 0;
  }

  return { years, months, days: d };
}

export function convertDaysToYMD( days = 0 ) {
  let years = Math.floor( days / 365 );
  const remainingDays = days % 365;

  let months = Math.floor( remainingDays / 30 );
  const d = remainingDays % 30;
  if ( months == 12 ) {
    years = years + 1;
    months = 0;
  }

  return { years, months, days: d };
}

/**
 * Adjust custody (hirasat & farar)
 * farar adds duration
 * hirasat reduces duration
 */
function adjustCustody( hirasat = {}, farar = {} ) {
  return {
    years: ( farar.years || 0 ) - ( hirasat.years || 0 ),
    months: ( farar.months || 0 ) - ( hirasat.months || 0 ),
    days: ( farar.days || 0 ) - ( hirasat.days || 0 )
  };
}


/**
 * Calculate BS duration
 */
function calculateBSDuration( startDate1, endDate1, custody ) {

  const startYear = startDate1.year;
  const startMonth = startDate1.month + 1;
  const startDay = startDate1.day;

  const endYear = endDate1.year;
  const endMonth = endDate1.month + 1;
  const endDay = endDate1.day;

  let years = endYear - startYear + custody.years;
  let months = endMonth - startMonth + custody.months;
  let days = endDay - startDay + custody.days;

  if ( days <= 0 ) {
    months--;
    days += 30;
  }

  if ( days >= 30 ) {
    months++;
    days -= 30;
  }

  if ( months < 0 ) {
    years--;
    months += 12;
  }

  if ( months === 12 && days === 0 ) {
    years++;
    months = 0;
    days = 0;
  }

  return { years, months, days };
}


/**
 * Calculate AD difference in days
 */
function calculateTotalDays( startAD, endAD ) {
  let totalDays = Math.floor( ( endAD - startAD ) / ( 1000 * 60 * 60 * 24 ) );
  if ( totalDays < 0 ) totalDays = 0;
  return totalDays;
}


/**
 * Main duration calculator
 */
export function calculateBSDate( startDate, endDate, options = {} ) {

  const {
    referenceDuration = null,
    hirasat = {},
    escape_days = 0   // <-- new simple escape input
  } = options;

  console.log( 'startDate:', startDate );
  console.log( 'endDate:', endDate );
  console.log( "Calculating duration with options:", options );

  // convert escape days → YMD
  const farar = convertDaysToYMD( escape_days );

  // combine custody effects
  const custody = adjustCustody( hirasat, farar );

  let startDate1, endDate1, startAD, endAD;
  let years = 0, months = 0, days = 0, totalDays = 0, percentage = null, formattedDuration = '0|0|0';

  try {
    startDate1 = new NepaliDate( startDate );
    endDate1 = new NepaliDate( endDate );

    startAD = startDate1.getDateObject();
    endAD = endDate1.getDateObject();

    // Calculate BS duration
    ({ years, months, days } = calculateBSDuration( startDate1, endDate1, custody ));
  } catch ( err ) {
    console.warn( "BS conversion failed. Falling back to AD:", err.message );

    const adResult = calculateADDuration( startDate, endDate, options );

    ({ years, months, days, totalDays, percentage, formattedDuration } = adResult);
  }

  // Calculate AD days
   totalDays = calculateTotalDays( startAD, endAD );

  const custodyDays =
    custody.years * 365 +
    custody.months * 30 +
    custody.days;

  totalDays += custodyDays;

  if ( referenceDuration?.totalDays > 0 ) {
    percentage = Number(
      ( ( totalDays / referenceDuration.totalDays ) * 100 ).toFixed( 2 )
    );
  }

  return {
    years,
    months,
    days,
    totalDays,
    percentage,
    formattedDuration: `${ years }|${ months }|${ days }`,
    usedFallback: false
  };
}

export function calculateADDuration( startDate, endDate, options = {} ) {
  const { hirasat = {}, escape_days = 0 } = options;
  const farar = escape_days;
  // console.log(hirasat, farar)
  const start = new Date( startDate );
  const end = new Date( endDate );

  if ( end < start ) return { years: 0, months: 0, days: 0, totalDays: 0, formattedDuration: '0|0|0' };

  // Step 1: get raw duration between dates
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if ( days < 0 ) {
    months--;
    const prevMonthDays = new Date( end.getFullYear(), end.getMonth(), 0 ).getDate();
    days += prevMonthDays;
  }

  if ( months < 0 ) {
    years--;
    months += 12;
  }

  // Step 2: apply custody adjustments
  let totalAdjustmentDays = ( farar || 0 ) -
    ( ( hirasat.years || 0 ) * 365 + ( hirasat.months || 0 ) * 30 + ( hirasat.days || 0 ) );

  days += totalAdjustmentDays;

  // Step 3: normalize overflow/underflow for days → months
  while ( days >= 30 ) {
    months++;
    days -= 30;
  }
  while ( days < 0 ) {
    months--;
    days += 30;
  }

  // Step 4: normalize overflow/underflow for months → years
  while ( months >= 12 ) {
    years++;
    months -= 12;
  }
  while ( months < 0 ) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor( ( end - start ) / ( 1000 * 60 * 60 * 24 ) ) + totalAdjustmentDays;

  return {
    years,
    months,
    days,
    totalDays: totalDays < 0 ? 0 : totalDays,
    formattedDuration: `${ years }|${ months }|${ days }`
  };
}