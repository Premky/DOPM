import { Grid2 } from '@mui/material'
import React from 'react'
import OfficeBranchForm from './OfficeBranchForm'
import BranchForm from './BranchForm'

const OfficeBranchPage = () => {
    return (
        <>
            <Grid2 container size={{sm:12}} spacing={1}  >
                <Grid2 size={{xs:12, sm:8}} sx={{padding:0, margin:0}} borderRight={5}>
                    <OfficeBranchForm />
                </Grid2>
                <Grid2 size={{xs:12, sm:4}} sx={{padding:2}} borderLeft={1}>
                    <BranchForm/>
                </Grid2>
            </Grid2>
        </>
    )
}

export default OfficeBranchPage