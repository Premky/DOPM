import { Avatar, Box, Button, Card, CardContent, Divider, Paper, Typography } from "@mui/material";
import EditEmployeeDialog from "../../ReusableComponents/EditEmployeeDialog";
import { useAuth } from "../../../../Context/AuthContext";
import { useState } from "react";
import { Grid } from "@mui/system";
import { useBaseURL } from "../../../../Context/BaseURLProvider";
// import { canEditEmployee } from "../../../utils/permissions";


const PersonalTab = ( { employee, refresh } ) => {
    const { state } = useAuth();
    const [open, setOpen] = useState( false );
    const BASE_URL = useBaseURL();
    //   const editable = canEditEmployee(state.user);
    const editable = true;

    return (
        <Box p={3}>
            <Grid container spacing={2}>


                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            {employee.photo_path && (
                                <Avatar

                                    src={employee.photo_path ? `${ BASE_URL }${ employee.photo_path }` : undefined}
                                    sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                                />
                            )}
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {employee.name_in_english}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                {employee.name_in_nepali}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    p: 1,
                                    bgcolor: 'primary.light',
                                    borderRadius: 1,
                                    mb: 2
                                }}
                            >
                                Sanket No: {employee.sanket_no}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    p: 1,
                                    bgcolor: 'success.light',
                                    borderRadius: 1,
                                    color: 'success.dark'
                                }}
                            >
                                {employee.emp_type || 'Unknown'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Personal Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Email
                                </Typography>
                                <Typography variant="body1">
                                    {employee.email || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Mobile Number
                                </Typography>
                                <Typography variant="body1">
                                    {employee.mobile_no || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Date of Birth
                                </Typography>
                                <Typography variant="body1">
                                    {employee.dob || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Gender
                                </Typography>
                                <Typography variant="body1">
                                    {/* {genderMap[employee.gender] || 'N/A'} */}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Marital Status
                                </Typography>
                                <Typography variant="body1">
                                    {employee.married_status || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Citizenship Number
                                </Typography>
                                <Typography variant="body1">
                                    {employee.citizenship_no || 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Address Information
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Ward Number
                                </Typography>
                                <Typography variant="body1">
                                    {employee.ward_no || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Issue District
                                </Typography>
                                <Typography variant="body1">
                                    {employee.issue_district || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">
                                    Issue Date
                                </Typography>
                                <Typography variant="body1">
                                    {employee.issue_date || 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>

                        {employee.remarks && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    Remarks
                                </Typography>
                                <Typography variant="body2">
                                    {employee.remarks}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
            {editable && (
                <Button onClick={() => setOpen( true )}>
                    व्यक्तिगत विवरण सम्पादन
                </Button>
            )}

            <EditEmployeeDialog
                open={open}
                employee={employee}
                employeeId={employee.id}
                onClose={() => setOpen( false )}
                onSaved={() => { setOpen( false ); refresh(); }}
            />
        </Box>
    );
};

export default PersonalTab;
