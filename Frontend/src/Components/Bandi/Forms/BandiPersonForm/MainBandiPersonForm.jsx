import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { bandiDefaultValues } from "./defaultValues";
import PersonalInfo from "./modules/PersonalInfo";
import useGetOfficeBandiId from "./hooks/useGetOfficeBandiId";

const MainBandiPersonForm = ({ onSubmit, onError, isEditMode = false }) => {
  const methods = useForm({
    mode: "onBlur",
    defaultValues: bandiDefaultValues,
  });

  const { setValue, getValues } = methods;
  const { getRandomBandiId } = useGetOfficeBandiId();

  useEffect(() => {
    if (isEditMode) return;

    const existingId = getValues("office_bandi_id");
    if (existingId) return;

    const loadBandiId = async () => {
      const id = await getRandomBandiId();
      if (id) {
        setValue("office_bandi_id", id, {
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    };

    loadBandiId();
  }, [isEditMode, getRandomBandiId, getValues, setValue]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
        <PersonalInfo />
      </form>
    </FormProvider>
  );
};

export default MainBandiPersonForm;
