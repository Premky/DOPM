// hooks/useFetchAllBandiFines.js
import { useEffect, useState } from "react";
import axios from "axios";
import { useBaseURL } from "../../../Context/BaseURLProvider";

const useFetchAllBandiFines = (bandiIds = []) => {
    const BASE_URL = useBaseURL();
    const [fineMap, setFineMap] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchAllFines = async () => {
        if (!bandiIds.length) return;

        try {
            setLoading(true);
            const response = await axios.post(
                `${BASE_URL}/payrole/get_all_bandi_fines`,
                { bandiIds },
                { withCredentials: true }
            );

            const { Status, Result } = response.data;

            if (Status && Array.isArray(Result)) {
                const grouped = Result.reduce((acc, fine) => {
                    const id = fine.bandi_id;
                    if (!acc[id]) acc[id] = [];
                    acc[id].push(fine);
                    return acc;
                }, {});
                setFineMap(grouped);
            }
        } catch (error) {
            console.error("Error fetching bulk bandi fines:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllFines();
    }, [BASE_URL, JSON.stringify(bandiIds)]); // use JSON.stringify to track changes correctly

    return { bandiFinesMap: fineMap, loading };
};

export default useFetchAllBandiFines;
