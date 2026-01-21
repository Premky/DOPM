import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import RoleSelect from "./RoleSelect";
// import axios from "axios";
import { useAxios } from "../../../hooks/useAxios.js";
import { useBaseURL } from "../../../Context/BaseURLProvider";

export default function MenuForm( { roles = [], menus = [], editingMenu, onSubmit } ) {
  const BASE_URL = useBaseURL();
  const axios = useAxios();

  const [parent_id, setParent_id] = useState( "" );
  const [title, setTitle] = useState( "" );
  const [icon, setIcon] = useState( "" );
  const [link, setLink] = useState( "" );
  const [order_no, setOrder_no] = useState( "" );
  const [selectedRoles, setSelectedRoles] = useState( [] );

  // Update form when editingMenu or menus change
  useEffect( () => {
    if ( editingMenu ) {
      // console.log(editingMenu)
      setParent_id( editingMenu.parent_id || "" );
      setTitle( editingMenu.title || "" );
      setIcon( editingMenu.icon || "" );
      setLink( editingMenu.link || "" );
      setOrder_no( editingMenu.order_no || "" );
      setSelectedRoles( editingMenu.roles || [] );
    } else {
      // Reset form for new menu
      setParent_id( "" );
      setTitle( "" );
      setIcon( "" );
      setLink( "" );
      setOrder_no( "" );
      setSelectedRoles( [] );
    }
  }, [editingMenu, menus, roles] ); // listen to menus & roles as well

  const handleSubmit = async ( e ) => {
    e.preventDefault();

    const menu = { parent_id, title, icon, link, order_no, roles: selectedRoles };

    try {
      if ( editingMenu ) {

        // UPDATE
        const res = await axios.put(
          `${ BASE_URL }/menu/menus/${ editingMenu.id }`,
          menu,
          { withCredentials: true }
        );
        onSubmit( { ...editingMenu, ...menu } );
      } else {
        // CREATE
        const res = await axios.post( `${ BASE_URL }/menu/menus`, menu, {
          withCredentials: true,
        } );
        onSubmit( { ...menu, id: res.data.id } );
      }
    } catch ( err ) {
      console.error( "Menu save failed:", err );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} direction="row" alignItems="center">

        {/* Parent Select */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Parent Menu</InputLabel>
          <Select
            value={parent_id}
            label="Parent Menu"
            onChange={( e ) => setParent_id( e.target.value )}
          >
            <MenuItem value="">None (Top Level)</MenuItem>

            {menus.map( ( m ) => (
              <MenuItem key={m.id} value={m.id}>
                {m.title}
              </MenuItem>
            ) )}
          </Select>
        </FormControl>

        <TextField
          label="Title"
          value={title}
          onChange={( e ) => setTitle( e.target.value )}
          required
        />

        <TextField
          label="Icon"
          value={icon}
          onChange={( e ) => setIcon( e.target.value )}
        />

        <TextField
          label="Link"
          value={link}
          onChange={( e ) => setLink( e.target.value )}
          required
        />

        <TextField
          label="Order No"
          value={order_no}
          type="number"
          onChange={( e ) => setOrder_no( e.target.value )}
        />

        <RoleSelect
          roles={roles}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
        />

        <Button variant="contained" type="submit">
          {editingMenu ? "Update" : "Add"}
        </Button>
      </Stack>
    </form>
  );
}
