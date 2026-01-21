import React, { useState } from "react";
import { Box, Stepper, Step, StepLabel, Paper, Button } from "@mui/material";
import StepBasicInfo from "./steps/StepBasicInfo.jsx";
import StepAppointment from "./steps/StepAppointment.jsx";
import StepConfirm from "./steps/StepConfirm.jsx";

const steps = ["Basic Info", "Appointment", "Confirm"];

const CreateEmployee = () => {
  const [activeStep, setActiveStep] = useState( 0 );
  const [formData, setFormData] = useState( {} );
  const [photoFile, setPhotoFile] = useState( null );

  const next = ( data ) => {
    if(data.photo){setPhotoFile(data.photo); delete data.photo}

    setFormData( ( prev ) => ( { ...prev, ...data } ) );
    setActiveStep( ( prev ) => prev + 1 );
  };

  const back = () => setActiveStep( ( prev ) => prev - 1 );

  return (
    <Paper sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map( ( label ) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ) )}
      </Stepper>

      {activeStep === 0 && <StepBasicInfo onNext={next} />}
      {activeStep === 1 && <StepAppointment onNext={next} onBack={back} />}
      {activeStep === 2 && <StepConfirm data={formData} photo={photoFile} onBack={back} />}
    </Paper>
  );
};

export default CreateEmployee;
