import React, { useEffect } from "react";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";


import { bandiDefaultValues } from "./defaultValues";

import PersonalInfo from "./modules/PersonalInfo";
// import AddressInfo from "./modules/AddressInfo";
// import KaidDetails from "./modules/KaidDetails";
// import MuddaSection from "./modules/MuddaSection";
// import FamilySection from "./modules/FamilySection";
// import HealthSection from "./modules/HealthSection";
// import RemarksSection from "./modules/RemarksSection";
import { useBaseURL } from "../../../../Context/BaseURLProvider";

const MainBandiPersonForm = ({ onSubmit, onError, isEditMode = false }) => {
  const methods = useForm({
    mode: "onBlur",
    defaultValues: bandiDefaultValues,
  });

  const { setValue, getValues } = methods;
  const { BASE_URL } = useBaseURL();

  useEffect(() => {
    if (isEditMode) return;

    const existingId = getValues("office_bandi_id");
    if (existingId) return; // do not overwrite

    const fetchRandomBandiId = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/bandi/get_random_bandi_id`,
          { withCredentials: true }
        );

        if (res.data?.Status) {
          setValue("office_bandi_id", res.data.Result, {
            shouldDirty: false,
            shouldTouch: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch bandi ID", err);
      }
    };

    fetchRandomBandiId();
  }, [BASE_URL, isEditMode, setValue, getValues]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <PersonalInfo />
        {/* <AddressInfo />
        <KaidDetails />
        <MuddaSection />
        <FamilySection />
        <HealthSection />
        <RemarksSection /> */}
      </form>
    </FormProvider>
  );
};

export default MainBandiPersonForm;
