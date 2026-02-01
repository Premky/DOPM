import { FormProvider, useForm } from "react-hook-form";
import { submitBandiPersonForm } from "./formSubmit";
import { bandiDefaultValues } from "./defaultValues";
import { useNavigate } from "react-router-dom";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
import useGetOfficeBandiId from "./hooks/useGetOfficeBandiId";
import { useEffect } from "react";
import PersonalInfo from "./modules/PersonalInfo";
import FamilySection from "./modules/FamilySection";
import MuddaSection from "./modules/MuddaSection";
import KaidDetailsSection from "./modules/KaidDetailsSection";
import AddressSection from "./modules/AddressSection";
import ContactPersonSection from "./modules/ContactPersonSection";
import IdCardSection from "./modules/IdCardSection";
import FineSection from "./modules/FineSection";
import HealthInsuranceDisabilitySection from "./modules/HealthInsuranceDisabilitySection";
import { Button } from "@mui/material";
import PunrabedanSection from "./modules/PunrabedanSection";



const MainBandiPersonForm = ( { onError, isEditMode = false } ) => {
  const methods = useForm( {
    mode: "onBlur",
    defaultValues: bandiDefaultValues,
  } );

  const navigate = useNavigate();
  const BASE_URL = useBaseURL();

  const {
    handleSubmit,
    setValue,
    getValues,
    reset,
  } = methods;

  const { getRandomBandiId } = useGetOfficeBandiId();

  useEffect( () => {
    if ( isEditMode ) return;

    const existingId = getValues( "office_bandi_id" );
    if ( existingId ) return;

    const loadBandiId = async () => {
      const id = await getRandomBandiId();
      if ( id ) {
        setValue( "office_bandi_id", id, {
          shouldDirty: false,
          shouldTouch: false,
        } );
      }
    };

    loadBandiId();
  }, [isEditMode, getRandomBandiId, getValues, setValue] );

  /* ✅ THIS IS THE ONLY CORRECT PLACE WHERE `data` EXISTS */
  const onSubmit = async ( data ) => {
    // console.log( "Date:", data );
    await submitBandiPersonForm( {
      data,
      BASE_URL,
      editing: isEditMode,
      navigate,
      reset,
    } );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit( onSubmit, onError )}>
        <PersonalInfo />
        <hr />
        <MuddaSection />
        <hr />
        <KaidDetailsSection />
        <hr />
        <IdCardSection />
        <hr />
        <AddressSection />
        <hr />
        <FamilySection />
        <hr />
        <ContactPersonSection />
        <hr />
        <FineSection />
        <hr />
        <PunrabedanSection />
        <hr />
        <HealthInsuranceDisabilitySection />
        <hr />

        <Button type="submit" variant="contained">
          Submit
        </Button>

      </form>
    </FormProvider>
  );
};
export default MainBandiPersonForm;