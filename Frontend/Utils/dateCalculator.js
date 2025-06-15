import NepaliDate from 'nepali-datetime';

export const calculateBSDate = (startDate, endDate, referenceDuration = null) => {
  try {
    const startDate1 = new NepaliDate(startDate);
    const endDate1 = new NepaliDate(endDate);

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

    const startAD = startDate1.getDateObject();
    const endAD = endDate1.getDateObject();

    let totalDays = Math.floor((endAD - startAD) / (1000 * 60 * 60 * 24));
    if (totalDays < 0) totalDays = 0;

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
  } catch (err) {
    console.error("Error in calculateBSDate:", err);
    // Return safe fallback object
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      percentage: 0
    };
  }
};



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
