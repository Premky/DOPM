import { Button, MenuItem } from "@mui/material";

const ClerkActions=({canApprove, onForward, onApprove})=>(
    <>
    <MenuItem onClick={onForward}>
        <Button variant="outlined"> कार्यालय प्रमुखमा पेश गर्नुहोस्</Button>
    </MenuItem>

    {canApprove &&(
        <MenuItem onClick={onApprove}>
            <Button variant="outlined" color="success"> Approve </Button>
        </MenuItem>
    )}
    </>
);

export default ClerkActions;