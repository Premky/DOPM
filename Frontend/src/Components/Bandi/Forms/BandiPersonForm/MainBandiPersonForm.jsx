import React, { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { bandiDefaultValues } from "./defaultValues";
import PersonalInfo from "./modules/PersonalInfo";
import useGetOfficeBandiId from "./hooks/useGetOfficeBandiId";
import FamilySection from "./modules/FamilySection";
import MuddaSection from "./modules/MuddaSection";
import KaidDetailsSection from "./modules/KaidDetailsSection";
import NepaliDate from "nepali-datetime";
import AddressSection from "./modules/AddressSection";
import ContactPersonSection from "./modules/ContactPersonSection";
import IdCardSection from "./modules/IdCardSection";
import FineSection from "./modules/FineSection";

const MainBandiPersonForm = ( { onSubmit, onError, isEditMode = false } ) => {
  const methods = useForm( {
    mode: "onBlur",
    defaultValues: bandiDefaultValues,
  } );

  const npToday = new NepaliDate();
  const formattedDateNp = npToday.format( 'YYYY-MM-DD' );

  const { handleSubmit, watch, setValue, getValues, register, reset, control, formState: { errors } } = methods;
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit( onSubmit, onError )}>
        <PersonalInfo />
        <hr />
        <FamilySection />
        <hr />
        <MuddaSection />
        <hr />
        <KaidDetailsSection formattedDateNp={formattedDateNp} />
        <hr />
        <AddressSection />
        <hr />
        <ContactPersonSection />
        <hr />
        <IdCardSection />
        <hr />
        <FineSection />
      </form>
    </FormProvider>
  );
};

export default MainBandiPersonForm;
