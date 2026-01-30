import axios from "axios";
import { useBaseURL } from "../../../../../Context/BaseURLProvider";


const useGetOfficeBandiId = () => {
    const  BASE_URL  = useBaseURL();    
    const getRandomBandiId = async () => {
        try {
            const res = await axios.get(
                `${ BASE_URL }/bandi/get_random_bandi_id`,
                { withCredentials: true }
            );

            // console.log( res );
            if ( res.data?.Status ) {
                return res.data.Result;
            }
            return "";
        } catch ( err ) {
            console.error( "Error fetching Bandi ID:", err );
            return "";
        }
    };
    return { getRandomBandiId };
};

export default useGetOfficeBandiId;
