import { useFormContext } from 'react-hook-form';
import { calculateBSDate, sumDates } from '../../../Utils/dateCalculator';
import { useEffect } from 'react';

const MuddaDurationCalculator = ({ index, formattedDateNp }) => {
    const { watch, setValue } = useFormContext();
    // console.log('Form Values:', watch());
    console.log('Form Values (JSON):', JSON.stringify(watch(), null, 2));
    console.log(`Set Field: kaid_duration_${index}`);
    console.log(watch(`kaid_duration_${index}`));  // Check if value exists here


    const hirasat_date_bs = watch(`hirasat_date_bs_${index}`);
    const release_date_bs = watch(`release_date_bs_${index}`);
    const hirasat_years = watch(`hirasat_years_${index}`);
    const hirasat_months = watch(`hirasat_months_${index}`);
    const hirasat_days = watch(`hirasat_days_${index}`);

    useEffect(() => {
        // console.log(`index: ${index}, हिरासत: ${hirasat_date_bs}, छुट्ने: ${release_date_bs}`);

        const calculateKaidDuration = () => {
            if (hirasat_date_bs && release_date_bs) {
                const kaidDuration = calculateBSDate(hirasat_date_bs, release_date_bs);
                const bhuktanDuration = calculateBSDate(hirasat_date_bs, formattedDateNp, kaidDuration);
                const berujuDuration = calculateBSDate(formattedDateNp, release_date_bs, kaidDuration);

                const totalkaidDuration = sumDates(hirasat_years, hirasat_months, hirasat_days, kaidDuration);
                const totalBhuktanDuration = sumDates(hirasat_years, hirasat_months, hirasat_days, bhuktanDuration);

                setValue(`kaid_duration_${index}`, `${kaidDuration.years}|${kaidDuration.months}|${kaidDuration.days}`);
                setValue(`total_kaid_duration_${index}`, `${totalkaidDuration.totalYears}|${totalkaidDuration.totalMonths}|${totalkaidDuration.totalDays}`);
                setValue(`total_bhuktan_duration_${index}`, `${totalBhuktanDuration.totalYears}|${totalBhuktanDuration.totalMonths}|${totalBhuktanDuration.totalDays}`);
                setValue(`bhuktan_duration_${index}`, `${bhuktanDuration.years}|${bhuktanDuration.months}|${bhuktanDuration.days}`);
                setValue(`beruju_duration_${index}`, `${berujuDuration.years}|${berujuDuration.months}|${berujuDuration.days}`);
            }
        };

        if (hirasat_date_bs?.length === 10 && release_date_bs?.length === 10) {
            calculateKaidDuration();
        }
    }, [
        hirasat_date_bs,
        release_date_bs,
        formattedDateNp,
        hirasat_years,
        hirasat_months,
        hirasat_days,
        setValue,
    ]);

    return null;
};

export default MuddaDurationCalculator;
