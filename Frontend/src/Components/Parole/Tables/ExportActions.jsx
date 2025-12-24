import { Menu, MenuItem } from "@mui/material";
import PayroleApplicationDocx from "../Exports/ParoleApplicationDocx";
import PayroleFileCoverDocx from "../Exports/PayroleFileCoverDocx";
import PayroleNoPunrabedanDocx from "../Exports/PayroleNoPunrabedanDocx";
import PayroleCharacterDocx from "../Exports/PayroleCharacterDocx";

const ExportActions = ( { data } ) => (
    <>
        <MenuItem><PayroleApplicationDocx data={data} /> </MenuItem>
        <MenuItem><PayroleFileCoverDocx data={data} /> </MenuItem>
        <MenuItem><PayroleNoPunrabedanDocx data={data} /></MenuItem>
        <MenuItem><PayroleCharacterDocx data={data} /></MenuItem>
    </>
);

export default ExportActions;