import React from 'react'
import BandiTable from './Tables/BandiTable'
import FamilyTable from './Tables/FamilyTable'
import { useParams } from 'react-router-dom'
import BandiIDTable from './Tables/BandiIDTable'
import BandiMuddaTable from './Tables/BandiMuddaTable'
import BandiFineTable from './Tables/BandiFineTable'
import BandiPunrabednTable from './Tables/BandiPunrabednTable.jsx'
import BandiAddressTable from './Tables/BandiAddressTable.jsx'
import BandiKaidTable from './Tables/BandiKaidTable.jsx'

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
            <BandiIDTable bandi_id={bandi_id} />
            <BandiMuddaTable bandi_id={bandi_id} />
            <BandiFineTable bandi_id={bandi_id} />
            <BandiPunrabednTable bandi_id={bandi_id} />
        </>
    )
}

export default ViewBandi