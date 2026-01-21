import { Dialog, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import StepBasicInfo from "../Forms/steps/StepBasicInfo";
import StepAppointment from "../Forms/steps/StepAppointment";


const EditEmployeeDialog = ({ open, employeeId, employee, onClose }) => {
  const methods = useForm({
    defaultValues: {},
    mode: "all",
  });

  const { reset, handleSubmit } = methods;
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const data = employee || (await getEmployeeById(employeeId))?.Result;
      reset(mapEmployeeToForm(data)); // 🔥 KEY
    };

    load();
  }, [open]);

  const onSubmit = async (data) => {
    await updateEmployee(employeeId, data);
    onClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>Edit Employee</DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Basic Info" />
        <Tab label="Appointment" />
      </Tabs>

      <DialogContent>
        <FormProvider {...methods}>
          {tab === 0 && (
            <StepBasicInfo
              control={methods.control}
              watch={methods.watch}
              onNext={handleSubmit(() => setTab(1))}
            />
          )}

          {tab === 1 && (
            <StepAppointment
              control={methods.control}
              onBack={() => setTab(0)}
              onNext={handleSubmit(onSubmit)}
            />
          )}
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
export default EditEmployeeDialog;