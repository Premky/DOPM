import axios from "axios";

export const submitBandiPersonForm= async({
    data,
    BASE_URL,
    editing,
    navigate,
    reset,
})=>{
    const url = editing
    ?`${BASE_URL}/bandi/update_bandi/${data._id}`
    :`${BASE_URL}/bandi/create_bandi`;

    const formData = buildFormData(data);

    const response = await axios.post(url, formData,{
        headers: {"Content-Type": "multipart/form-data"},
        withCredentials: true,
    })
    return response.data;
}