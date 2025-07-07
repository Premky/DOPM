import React from 'react'
import { useParams } from 'react-router-dom'
import BandiTable from './Tables/For View/BandiTable'
import FamilyTable from './Tables/For View/FamilyTable'
import BandiIDTable from './Tables/For View/BandiIDTable'
import BandiMuddaTable from './Tables/For View/BandiMuddaTable'
import BandiFineTable from './Tables/For View/BandiFineTable'
import BandiPunrabednTable from './Tables/For View/BandiPunrabednTable.jsx'
import BandiAddressTable from './Tables/For View/BandiAddressTable.jsx'
import BandiKaidTable from './Tables/For View/BandiKaidTable.jsx'
import BandiContactPersonTable from './Tables/For View/ContactPersonTable.jsx';


const ViewBandi = ({ bandi }) => {
    const params = useParams();

    // Prefer the passed prop, fallback to param
    const bandi_id = bandi ? bandi : params.bandi_id;

    return (
        <>
            <BandiTable bandi_id={bandi_id} />
            <BandiKaidTable bandi_id={bandi_id}/>
            <BandiAddressTable bandi_id={bandi_id}/>
            <FamilyTable bandi_id={bandi_id} />
            <BandiContactPersonTable bandi_id={bandi_id}/>
            <BandiIDTable bandi_id={bandi_id} />
            <BandiMuddaTable bandi_id={bandi_id} />
            <BandiFineTable bandi_id={bandi_id} />
            <BandiPunrabednTable bandi_id={bandi_id} />
        </>
    )
}

export default ViewBandi