import { Grid2, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react'

const TotalReleaseDetails = () => {
  return (
    <div>
       <Grid2 container>
        </Grid2> 
       <Grid2 container>
        <TableContainer>
            <Table border='1' size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>अदालतको आदेश वा नियमित छुट</TableCell>
                        <TableCell colSpan={2}>कामदारी सुविधा पाएका</TableCell>
                        <TableCell colSpan={2}>माफि मिनाहा पाएका छुट</TableCell>
                        <TableCell colSpan={2}>मुलुकी फौजदारी कार्यविधीको दफा १५५</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>हाल सम्मको</TableCell>
                        <TableCell>यो महिनाको</TableCell>
                        <TableCell>हाल सम्मको</TableCell>
                        <TableCell>यो महिनाको</TableCell>
                        <TableCell>हाल सम्मको</TableCell>
                        <TableCell>यो महिनाको</TableCell>
                        <TableCell>हाल सम्मको</TableCell>
                        <TableCell>यो महिनाको</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>
        </Grid2> 
    </div>
  )
}

export default TotalReleaseDetails