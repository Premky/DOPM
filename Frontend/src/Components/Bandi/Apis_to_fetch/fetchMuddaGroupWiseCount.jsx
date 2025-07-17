// hooks/fetchMuddaWiseCount.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";


const fetchMuddaGroupWiseCount = ({ filters }) => {
    const BASE_URL = useBaseURL();
    const [records, setRecords] = useState([]);
    const [optrecords, setOptRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const [muddawisetotal, setMuddawisetotal] = useState({
        KaidiTotal: 0,
        ThunuwaTotal: 0,
        KaidiMale: 0,
        KaidiFemale: 0,
        ThunuwaMale: 0,
        ThunuwaFemale: 0,
        SumOfArrestedInDateRange: 0,
        SumOfReleasedInDateRange: 0,
        KaidiAgeAbove65: 0,
        ThunuwaAgeAbove65: 0,
        Nabalak: 0,
        Nabalika: 0,
        Total: 0
    });

    const calculateTotals = (data) => {
        const totals = data.reduce((acc, record) => ({
            KaidiTotal: acc.KaidiTotal + (parseInt(record.KaidiTotal) || 0),
            ThunuwaTotal: acc.ThunuwaTotal + (parseInt(record.ThunuwaTotal) || 0),
            KaidiMale: acc.KaidiMale + (parseInt(record.KaidiMale) || 0),
            KaidiFemale: acc.KaidiFemale + (parseInt(record.KaidiFemale) || 0),
            ThunuwaMale: acc.ThunuwaMale + (parseInt(record.ThunuwaMale) || 0),
            ThunuwaFemale: acc.ThunuwaFemale + (parseInt(record.ThunuwaFemale) || 0),
            SumOfArrestedInDateRange: acc.SumOfArrestedInDateRange + (parseInt(record.TotalArrestedInDateRange) || 0),
            SumOfReleasedInDateRange: acc.SumOfReleasedInDateRange + (parseInt(record.TotalReleasedInDateRange) || 0),
            KaidiAgeAbove65: acc.KaidiAgeAbove65 + (parseInt(record.KaidiAgeAbove65) || 0),
            ThunuwaAgeAbove65: acc.ThunuwaAgeAbove65 + (parseInt(record.ThunuwaAgeAbove65) || 0),
            Nabalak: acc.Nabalak + (parseInt(record.Nabalak) || 0),
            Nabalika: acc.Nabalika + (parseInt(record.Nabalika) || 0),
            Total: acc.Total + (parseInt(record.Total) || 0),
        }), { ...muddawisetotal });

        setMuddawisetotal(totals);
    };

    useEffect(() => {
        // if (!filters?.selectedOffice || !filters?.startDate) return;

        const fetchRecords = async () => {
            setLoading(true);

            const queryParams = new URLSearchParams({
                startDate: filters.startDate || '',
                endDate: filters.endDate || '',
                office_id: filters.selectedOffice || '',
                nationality: filters.nationality || '',
                ageFrom: filters.ageFrom || '',
                ageTo: filters.ageTo || '',
            });

            const fullUrl = `${BASE_URL}/bandi/get_prisioners_count_for_maskebari?${queryParams.toString()}`;
            console.log("Fetching URL:", fullUrl);

            try {
                const response = await axios.get(fullUrl, { withCredentials: true });
                const { Status, Result } = response.data;

                if (Status && Result && typeof Result === 'object') {
                    const resultArray = Object.values(Result);
                    const formatted = resultArray.map((opt, index) => ({
                        label: `${opt.relative_name || ''}||${opt.relative_address || ''}||${opt.relative_contact_no || ''}`,
                        value: opt.id || index
                    }));
                    setRecords(resultArray);
                    setOptRecords(formatted);
                    calculateTotals(resultArray);
                } else {
                    console.log('No records found');
                }
            } catch (error) {
                console.error("Failed to fetch mudda wise count:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, [BASE_URL, filters]);
    console.log(records);
    console.log(muddawisetotal)

    return { records, muddawisetotal, optrecords, loading };
};

export default fetchMuddaGroupWiseCount;
