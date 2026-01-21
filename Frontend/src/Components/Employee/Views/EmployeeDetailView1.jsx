import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Card,
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { getEmployeeById, deleteEmployee } from '../services/employeeService';
import { useBaseURL } from '../../../Context/BaseURLProvider';
import EditEmployeeDialog from '../ReusableComponents/EditEmployeeDialog';
import EditJobDetailDialog from '../ReusableComponents/EditJobDetailDialog';

const EmployeeDetailView = () => {
  const { id } = useParams();
  const BASE_URL = useBaseURL();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState( null );
  const [loading, setLoading] = useState( true );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState( false );
  const [editEmpOpen, setEditEmpOpen] = useState( false );
  const [jobDialogOpen, setJobDialogOpen] = useState( false );
  const [jobDialogMode, setJobDialogMode] = useState( 'add' );
  const [selectedJob, setSelectedJob] = useState( null );

  // Fetch employee data (exposed so dialogs can trigger a refresh)
  const fetchEmployee = async () => {
    try {
      setLoading( true );
      const response = await getEmployeeById( id );
      // Normalize response shape: controller returns { success, data } whereas some endpoints may return raw employee
      let payload = response;
      if ( response && response.success && response.data ) payload = response.data;

      // Normalize jobDetails to expected view fields
      if ( payload && Array.isArray( payload.jobDetails ) ) {
        payload.jobDetails = payload.jobDetails.map( jd => ( {
          id: jd.id,
          start_date: jd.appointment_date_bs || jd.appointment_date_ad || jd.hajir_miti_bs || null,
          end_date: jd.end_date || jd.hajir_miti_ad || null,
          position: jd.jd || jd.post_id || null,
          level: jd.level_name_np || jd.level_id || null,
          service_group: jd.service_name_np || jd.service_group_id || null,
          office: jd.current_office_np || jd.office_id || jd.kaaj_office_np || null,
          raw: jd
        } ) );
      }

      setEmployee( payload );
    } catch ( error ) {
      console.error( 'Error fetching employee:', error );
      Swal.fire( { icon: 'error', title: 'Error', text: 'Failed to load employee details' } );
      navigate( '/employees' );
    } finally {
      setLoading( false );
    }
  };

  useEffect( () => {
    if ( id ) fetchEmployee();
  }, [id] );

  // Handle Edit
  const handleEditEmployee = () => {
    setEditEmpOpen( true );
  };

  const handleAddJob = () => {
    setSelectedJob( null );
    setJobDialogMode( "add" );
    setJobDialogOpen( true );
  };

  const handleEditJob = ( job ) => {
    setSelectedJob( job );
    setJobDialogMode( "edit" );
    setJobDialogOpen( true );
  };


  // Handle delete
  const handleDelete = async () => {
    try {
      const result = await deleteEmployee( id );

      if ( result.success ) {
        Swal.fire( {
          icon: 'success',
          title: 'Success',
          text: 'Employee deleted successfully'
        } );
        navigate( '/employees' );
      }
    } catch ( error ) {
      Swal.fire( {
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to delete employee'
      } );
    } finally {
      setDeleteConfirmOpen( false );
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if ( loading ) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if ( !employee ) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Employee not found
        </Typography>
      </Box>
    );
  }

  const empTypeMap = {
    1: 'Permanent',
    2: 'Contract',
    3: 'Daily'
  };

  const genderMap = {
    M: 'Male',
    F: 'Female',
    O: 'Other'
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate( '/emp/view_employee' )}
            variant="text"
          >
            Back
          </Button>
          <Typography variant="h4">
            Employee Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handlePrint}
          >
            Print
          </Button> */}
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={handleEditEmployee}
          >
            Edit
          </Button>

          <Button
            startIcon={<DeleteIcon />}
            variant="contained"
            color="error"
            onClick={() => setDeleteConfirmOpen( true )}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
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

        {/* Details Card */}
        <Grid item xs={12} md={8}>
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
                  {genderMap[employee.gender] || 'N/A'}
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

        {/* Job Details */}
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

        {/* Metadata */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              System Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Created At
                </Typography>
                <Typography variant="body2">
                  {new Date( employee.created_at ).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {new Date( employee.updated_at ).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <EditEmployeeDialog
        open={editEmpOpen}
        onClose={() => setEditEmpOpen( false )}
        employeeId={id}
        employee={employee}
        onSaved={() => { setEditEmpOpen( false ); fetchEmployee(); }}
      />

      <EditJobDetailDialog
        open={jobDialogOpen}
        onClose={() => setJobDialogOpen( false )}
        mode={jobDialogMode}
        jobData={selectedJob}
        employeeId={id}
        onSaved={() => { setJobDialogOpen( false ); fetchEmployee(); }}
      />
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen( false )}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {employee.name_in_english}? This action can be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen( false )}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDetailView;
