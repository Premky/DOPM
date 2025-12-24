import { MenuItem, Button } from "@mui/material";

const SupervisorActions = ({ onForward, onApprove }) => (
  <>
    <MenuItem onClick={onForward}>
      <Button variant="outlined" color="warning">Forward / Backward</Button>
    </MenuItem>

    <MenuItem onClick={onApprove}>
      <Button variant="outlined" color="success">Approve</Button>
    </MenuItem>
  </>
);

export default SupervisorActions;
