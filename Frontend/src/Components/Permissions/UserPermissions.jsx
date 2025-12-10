import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { usePermissionAPI } from "../../api/usePermissions";
import { useUserAPI } from "../../api/useUsers";

const UserPermissions = () => {
    const { getUsers, assignUserPermissions } = useUserAPI();
    const { getPermissions } = usePermissionAPI();

    const [users, setUsers] = useState( [] );
    const [permissions, setPermissions] = useState( [] );
    const [selectedUser, setSelectedUser] = useState( null );
    const [selectedPermissions, setSelectedPermissions] = useState( [] );
    const [loading, setLoading] = useState( false );

    // Load users and permissions
    useEffect( () => {
        ( async () => {
            try {
                const usersRes = await getUsers();
                const usersResult = usersRes.result || usersRes.Result || [];
                setUsers( usersResult.map( u => ( { ...u, id: u.id } ) ) );

                const permsRes = await getPermissions();
                const permsResult = permsRes.result || [];
                setPermissions( permsResult.map( p => ( { ...p, id: p.id } ) ) );
            } catch ( error ) {
                console.error( "Error loading data:", error );
            }
        } )();
    }, [] );

    // Assign permissions to selected user
    const handleAssign = async () => {
        if ( !selectedUser ) {
            alert( "Please select a user!" );
            return;
        }

        setLoading( true );
        try {
            await assignUserPermissions( selectedUser.id, selectedPermissions );
            alert( "Permissions assigned successfully!" );
        } catch ( err ) {
            alert( "Error assigning permissions." );
        }
        setLoading( false );
    };

    // DataGrid columns
    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "user_login_id", headerName: "Username", width: 200 },
        {
            field: "permissions",
            headerName: "Assigned Permissions",
            width: 400,
            valueGetter: ( params ) => {
                const perms = params?.row?.permissions;
                if ( !Array.isArray( perms ) || perms.length === 0 ) return "-";
                return perms.map( p => `${ p.module_name }-${ p.action_name }` ).join( ", " );
            }
        }
    ];

    return (
        <Box>
            <h3>Assign Permissions to Users</h3>

            {/* Select User */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select User</InputLabel>
                <Select
                    value={selectedUser?.id || ""}
                    onChange={( e ) => {
                        const user = users.find( u => u.id === e.target.value );
                        setSelectedUser( user );
                        setSelectedPermissions( user?.permissions?.map( p => p.id ) || [] );
                    }}
                >
                    {users.map( u => (
                        <MenuItem key={u.id} value={u.id}>
                            {u.user_login_id}
                        </MenuItem>
                    ) )}
                </Select>
            </FormControl>

            {/* Select Permissions */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Permissions</InputLabel>
                <Select
                    multiple
                    value={selectedPermissions}
                    onChange={( e ) => setSelectedPermissions( e.target.value )}
                    renderValue={( selected ) =>
                        selected
                            .map( id => permissions.find( p => p.id === id )?.action_name )
                            .join( ", " )
                    }
                >
                    {permissions.map( p => (
                        <MenuItem key={p.id} value={p.id}>
                            <Checkbox checked={selectedPermissions.includes( p.id )} />
                            <ListItemText primary={`${ p.module_name } - ${ p.action_name }`} />
                        </MenuItem>
                    ) )}
                </Select>
            </FormControl>

            <Button
                variant="contained"
                onClick={handleAssign}
                disabled={loading}
            >
                {loading ? "Assigning..." : "Assign Permissions"}
            </Button>

            {/* Users Table */}
            <Box sx={{ height: 400, mt: 3 }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10]}
                    disableSelectionOnClick
                />
            </Box>
        </Box>
    );
};

export default UserPermissions;
