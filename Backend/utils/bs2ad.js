import NepaliDate from 'nepali-datetime';
export async function bs2ad(date) {
    const bsdob = new NepaliDate(date)
    const addob = bsdob.formatEnglishDate('YYYY-MM-DD')
    return addob;
}