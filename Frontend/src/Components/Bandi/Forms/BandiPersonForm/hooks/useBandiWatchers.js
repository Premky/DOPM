import { useEffect } from "react";
import { calculateAge } from "../../../../../../Utils/ageCalculator";

export const useBandiWatchers = () => {
    const { watch, setValue } = useFormContext();

    const isActive = watch( "isActive" );
    const nationality = watch( "nationality" );
    const dob = watch( "dob" );

    useEffect( () => {
        if ( dob ) {
            calculateAge( dob ).then( age => setValue( 'age', age ) );
        }
    }, [dob] );

    return {
        isActive,
        isSwadeshi: nationality === "स्वदेशी",
    };
};