import NepaliDate from 'nepali-datetime';

export const calculateBSDate = (startDate, endDate, referenceDuration = null) => {
  try {
    // Validate input
    if (!startDate || !endDate) {
      throw new Error(`Invalid input: startDate="${startDate}", endDate="${endDate}"`);
    }

    const startDate1 = new NepaliDate(startDate);
    const endDate1 = new NepaliDate(endDate);

    // Check if valid NepaliDate objects
    const startAD = startDate1.getDateObject();
    const endAD = endDate1.getDateObject();

    if (isNaN(startAD) || isNaN(endAD)) {
      throw new Error(`Invalid date objects from NepaliDate: start="${startDate}", end="${endDate}"`);
    }

    const startYear = startDate1.year;
    const startMonth = startDate1.month + 1;
    const startDay = startDate1.day;

    const endYear = endDate1.year;
    const endMonth = endDate1.month + 1;
    const endDay = endDate1.day;

    let years = endYear - startYear;
    let months = endMonth - startMonth;
    let days = endDay - startDay;

    if (days < 0) {
      months--;
      days += NepaliDate.getDaysOfMonth(endYear, endMonth - 1);
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Total days in AD
    let totalDays = Math.floor((endAD - startAD) / (1000 * 60 * 60 * 24));
    if (totalDays < 0) totalDays = 0;

    // Optional percentage calculation
    let percentage = null;
    if (referenceDuration && referenceDuration.totalDays > 0) {
      percentage = ((totalDays / referenceDuration.totalDays) * 100).toFixed(2);
    }

    return {
      years,
      months,
      days,
      totalDays,
      percentage: percentage ? parseFloat(percentage) : undefined,
      formattedDuration: `${years} वर्ष, ${months} महिना, ${days} दिन`,
      rawFormatted: `${years}|${months}|${days}`
    };

  } catch (err) {
    console.error("Error in calculateBSDate:", err.message);
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      percentage: 0,
      formattedDuration: '',
      rawFormatted: '0|0|0'
    };
  }
};


export const sumDates = (hirasat_years, hirasat_months, hirasat_days, referenceDuration = null) => {
  try {
    let totalYears = parseFloat(referenceDuration.years || 0) + parseFloat(hirasat_years || 0);
    let totalMonths = parseFloat(referenceDuration.months || 0) + parseFloat(hirasat_months || 0);
    let totalDays = parseFloat(referenceDuration.days || 0) + parseFloat(hirasat_days || 0);
  
    // Normalize days to months
    if (totalDays >= 30) {
      totalMonths += Math.floor(totalDays / 30);
      totalDays = totalDays % 30;
    }

    // Normalize months to years
    if (totalMonths >= 12) {
      totalYears += Math.floor(totalMonths / 12);
      totalMonths = totalMonths % 12;
    }

    return {
      totalDays: totalDays,
      totalMonths: totalMonths,
      totalYears: totalYears
    }
  } catch {
    return {
      totalDays: 0,
      totalMonths: 0,
      totalYears: 0
    }
  }
  // Parse and add kaid and hirasat durations

}

export const calculateDateDetails = (startDate, endDate, referenceDuration = null) => {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return null;

  let totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (totalDays < 0) totalDays = 0;

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  let percentage = null;
  if (referenceDuration && referenceDuration.totalDays > 0) {
    percentage = ((totalDays / referenceDuration.totalDays) * 100).toFixed(2);
  }

  return {
    years,
    months,
    days,
    totalDays,
    percentage: percentage ? parseFloat(percentage) : undefined
  };
};
