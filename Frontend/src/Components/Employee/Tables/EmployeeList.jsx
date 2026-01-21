import React, { useState, useEffect, useCallback } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RemoveRedEye as EyeIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getEmployees, deleteEmployee, restoreEmployee, getEmployeeStats } from '../services/employeeService';
import { useBaseURL } from '../../../Context/BaseURLProvider';

const EmployeeList = () => {
  const navigate = useNavigate();
  const { BASE_URL } = useBaseURL();
  const [employees, setEmployees] = useState( [] );
  const [loading, setLoading] = useState( true );
  const [stats, setStats] = useState( null );
  const [paginationModel, setPaginationModel] = useState( {
    pageSize: 10,
    page: 0,
  } );
  const [searchText, setSearchText] = useState( '' );
  const [empTypeFilter, setEmpTypeFilter] = useState( '' );
  const [rowCountState, setRowCountState] = useState( 0 );
  const [sortModel, setSortModel] = useState( [] );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState( false );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState( null );

  // Fetch employees
  const fetchEmployees = useCallback( async () => {
    try {
      setLoading( true );
      const response = await getEmployees( {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchText,
        emp_type: empTypeFilter,
        sortBy: sortModel.length > 0 ? sortModel[0].field : 'created_at',
        sortOrder: sortModel.length > 0 ? sortModel[0].sort?.toUpperCase() : 'DESC'
      } );

      if ( response.success ) {
        setEmployees( response.data || [] );
        setRowCountState( response.pagination?.total || 0 );
      }
    } catch ( error ) {
      console.error( 'Error fetching employees:', error );
      Swal.fire( {
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch employees'
      } );
    } finally {
      setLoading( false );
    }
  }, [paginationModel, searchText, empTypeFilter, sortModel] );

  // Fetch stats
  const fetchStats = useCallback( async () => {
    try {
      const response = await getEmployeeStats();
      if ( response.success ) {
        setStats( response.data );
      }
    } catch ( error ) {
      console.error( 'Error fetching stats:', error );
    }
  }, [] );

  // Initial fetch
  useEffect( () => {
    fetchEmployees();
    fetchStats();
  }, [fetchEmployees, fetchStats] );

  // Handle delete
  const handleDelete = async () => {
    try {
      const result = await deleteEmployee( selectedEmployeeId );

      if ( result.success ) {
        Swal.fire( {
          icon: 'success',
          title: 'Success',
          text: 'Employee deleted successfully'
        } );
        fetchEmployees();
      }
    } catch ( error ) {
      Swal.fire( {
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to delete employee'
      } );
    } finally {
      setDeleteConfirmOpen( false );
      setSelectedEmployeeId( null );
    }
  };

  // Handle restore
  const handleRestore = async ( id ) => {
    try {
      const result = await restoreEmployee( id );

      if ( result.success ) {
        Swal.fire( {
          icon: 'success',
          title: 'Success',
          text: 'Employee restored successfully'
        } );
        fetchEmployees();
      }
    } catch ( error ) {
      Swal.fire( {
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to restore employee'
      } );
    }
  };

  const columns = [
    {
      field: 'emp_id',
      headerName: 'ID',
      width: 70,
      filterable: false
    },
    // {
    //   field: "photo_path",
    //   headerName: "फोटो",
    //   width: 100,
    //   renderCell: ( params ) =>
    //     params.value ? (
    //       <img
    //         src={`${ BASE_URL }${ params.value }`}
    //         alt="फोटो"
    //         style={{
    //           width: 50,
    //           height: 50,
    //           borderRadius: "50%",
    //           cursor: "pointer",
    //           objectFit: "cover"
    //         }}
    //         onClick={() =>
    //           Swal.fire( {
    //             imageUrl: `${ BASE_URL }${ params.value }`,
    //             imageAlt: "फोटो",
    //             showConfirmButton: false,
    //           } )
    //         }
    //       />
    //     ) : (
    //       <Typography variant="caption">No Image</Typography>
    //     )

    // },
    {
      field: 'current_office_np',
      headerName: 'कार्यालय',
      width: 180
    },
    {
      field: 'sanket_no',
      headerName: 'संकेत नं.',
      width: 120
    },

    {
      field: 'name_in_nepali',
      headerName: 'नाम (नेपाली)',
      width: 180
    },
    {
      field: 'mobile_no',
      headerName: 'Mobile',
      width: 120
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100
    },
    {
      field: 'post_name_np',
      headerName: 'पद',
      width: 120
    },
    {
      field: 'is_office_chief',
      headerName: 'कारागार प्रशासक?',
      width: 120
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: ( params ) => (
        <Chip
          label={params.row.is_active ? 'Active' : 'Inactive'}
          color={params.row.is_active ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      cellClassName: 'actions',
      getActions: ( params ) => {
        const { row } = params;
        const emp_id = row.emp_id;

        return [
          <GridActionsCellItem
            icon={<EyeIcon />}
            label="View"
            onClick={() => navigate( `/emp/view_employee/${ emp_id }` )}
            color="primary"
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate( `/emp/edit_employee/${ emp_id }` )}
            color="primary"
          />,
          row.is_active ? (
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => {
                setSelectedEmployeeId( emp_id );
                setDeleteConfirmOpen( true );
              }}
              color="error"
            />
          ) : (
            <GridActionsCellItem
              icon={<RestoreIcon />}
              label="Restore"
              onClick={() => handleRestore( emp_id )}
              color="warning"
            />
          ),
        ];
      }

    }
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        csvOptions={{
          fileName: `employees-${ new Date().toISOString() }`
        }}
        printOptions={{
          hideFooter: true,
          hideToolbar: true
        }}
      />
    </GridToolbarContainer>
  );

  if ( loading && employees.length === 0 ) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 'auto', p: 3 }}>
      {/* Header with Stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Employee Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate( '/employees/create' )}
          >
            Add New Employee
          </Button>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total
                  </Typography>
                  <Typography variant="h5">
                    {stats.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Permanent
                  </Typography>
                  <Typography variant="h5">
                    {stats.permanent_count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Contract
                  </Typography>
                  <Typography variant="h5">
                    {stats.contract_count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Daily
                  </Typography>
                  <Typography variant="h5">
                    {stats.daily_count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Male
                  </Typography>
                  <Typography variant="h5">
                    {stats.male_count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Female
                  </Typography>
                  <Typography variant="h5">
                    {stats.female_count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email, or sanket no..."
              value={searchText}
              onChange={( e ) => {
                setSearchText( e.target.value );
                setPaginationModel( { ...paginationModel, page: 0 } );
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="Employee Type"
              value={empTypeFilter}
              onChange={( e ) => {
                setEmpTypeFilter( e.target.value );
                setPaginationModel( { ...paginationModel, page: 0 } );
              }}
              SelectProps={{
                native: true,
              }}
              size="small"
            >
              <option value="">All Types</option>
              <option value="1">Permanent</option>
              <option value="2">Contract</option>
              <option value="3">Daily</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setSearchText( '' );
                setEmpTypeFilter( '' );
                setPaginationModel( { pageSize: 10, page: 0 } );
              }}
              size="small"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={employees}
          columns={columns}
          getRowId={( row ) => row.emp_id}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCountState}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          slots={{ toolbar: CustomToolbar }}
          sx={{
            '& .actions': {
              color: 'text.secondary',
            },
            '& .actions:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen( false );
          setSelectedEmployeeId( null );
        }}
      >
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this employee? This action can be undone.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen( false );
              setSelectedEmployeeId( null );
            }}
          >
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

export default EmployeeList;
