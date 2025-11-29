import axios from "axios";

export const getRoles = async()=>{
    try{
        const response = await axios.get("/permission/roles")
    }catch(error){
        console.error("Failed to fetch roles", error)
        throw error;
    }
}

export const assignRolePermissions = async(roleId, permissionsIds) =>{
    try{
        const response = await axios.post(`/permission/roles/${roleId}/permissions`,{permissions:permissionsIds});
        return response.data;
    }catch(error){
        console.error("Error Assigning Role Permissions:", error);
        throw error;
    }
}