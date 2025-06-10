import { Box, Grid2 } from '@mui/material'
import React from 'react'
import Darbandi from '../Tables/Darbandi'

const Dashboard = () => {
    return (
        <>
            <Box sx={{ flexGrow: 1, margin: 2 }}>
                <Grid2 container spacing={1}>
                    {/* <Grid2 size={{ xs: 12, sm: 9, md: 8 }}>
                        dasf
                    </Grid2> */}
                    <Grid2 size={{ xs: 12, sm: 3, md: 8 }}>
                        <Darbandi/>
                    </Grid2>
                </Grid2>
            </Box>
        </>
    )
}

export default Dashboard