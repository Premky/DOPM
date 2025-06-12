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
