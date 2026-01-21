import { Button, Grid, Paper, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import EditJobDetailDialog from "../../ReusableComponents/EditJobDetailDialog";
import { useState } from "react";


const JobTab = ( { employee, refresh } ) => {
    const [open, setOpen] = useState( false );
    const [selected, setSelected] = useState( null );

    const handleAddJob = () => {
        setSelected( null );
        setJobDialogMode( "add" );
        setJobDialogOpen( true );
    };

    const handleEditJob = ( job ) => {
        setSelected( job );
        setJobDialogMode( "edit" );
        setJobDialogOpen( true );
    };
    return (
        <>
            <Button onClick={() => { setSelected( null ); setOpen( true ); }}>
                नयाँ नियुक्ति थप्नुहोस्
            </Button>

            {employee.jobDetails.map( jd => (
                <Button onClick={() => { setSelected( jd ); setOpen( true ); }}>
                    सम्पादन
                </Button>
            ) )}
            {employee.jobDetails && employee.jobDetails.length > 0 && (
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Job Details History
                            </Typography>
                            <Button variant="outlined" onClick={handleAddJob}>
                                Add Job
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>End Date</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Level</TableCell>
                                        <TableCell>Service Group</TableCell>
                                        <TableCell>Office</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employee.jobDetails.map( ( jd, index ) => (
                                        <TableRow key={index}>
                                            <TableCell>{jd.start_date || 'N/A'}</TableCell>
                                            <TableCell>{jd.end_date || 'Ongoing'}</TableCell>
                                            <TableCell>{jd.position || 'N/A'}</TableCell>
                                            <TableCell>{jd.level || 'N/A'}</TableCell>
                                            <TableCell>{jd.service_group || 'N/A'}</TableCell>
                                            <TableCell>{jd.office || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Button size="small" onClick={() => handleEditJob( jd )}>
                                                    Edit
                                                </Button>

                                            </TableCell>
                                        </TableRow>
                                    ) )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            )}
            <EditJobDetailDialog
                open={open}
                jobData={selected}
                mode={selected ? "edit" : "add"}
                employeeId={employee.id}
                onClose={() => setOpen( false )}
                onSaved={() => { setOpen( false ); refresh(); }}
            />
        </>
    );
};
export default JobTab;