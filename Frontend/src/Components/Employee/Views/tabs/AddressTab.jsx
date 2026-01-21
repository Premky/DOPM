import { Button } from "@mui/material";
import EditJobDetailDialog from "../../ReusableComponents/EditJobDetailDialog";
import { useState } from "react";


const AddressTab = ( { employee, refresh } ) => {
    const [open, setOpen] = useState( false );
    const [selected, setSelected] = useState( null );

    return (
        <>
            <Button onClick={() => { setSelected( null ); setOpen( true ); }}>
                नयाँ नियुक्ति थप्नुहोस्
            </Button>

            {employee.jobDetails.map( jd => (
                <Button onClick={() => { setSelected( jd ); setOpen( true ); }}>
                    सम्पादन
                </Button>
            ) )}

            <EditJobDetailDialog
                open={open}
                jobData={selected}
                mode={selected ? "edit" : "add"}
                employeeId={employee.id}
                onClose={() => setOpen( false )}
                onSaved={() => { setOpen( false ); refresh(); }}
            />
        </>
    );
};
export default AddressTab;