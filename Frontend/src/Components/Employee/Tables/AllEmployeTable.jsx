import React, { useEffect, useState, Fragment, lazy, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Menu,
    MenuItem,
    Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Swal from "sweetalert2";
import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import { Helmet } from "react-helmet";
import EmpActionMenu from "./EmpActionMenu";
import TransferEmployeeDialog from "../ReusableComponents/TransferEmployeeDialog";
import useAllEmployees from "../APIs/useAllEmployee";
import EmpTableFilters from "./EmpTableFilters";
import EditJobDetailDialog from "../ReusableComponents/EditJobDetailDialog";


const AllEmployeTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();


    const [filters, setFilters] = useState( {
        office: "all",
        empType: "all",
        jd: "all",
        is_chief: "all",
        search: "",
        sanket_no: "",
        post: "",
    } );

    const [page, setPage] = useState( 0 );
    const [rowsPerPage, setRowsPerPage] = useState( 25 );

    const { records: empRecords, loading, refetch: refetchEmp } = useAllEmployees();

    const [menuAnchorEl, setMenuAnchorEl] = useState( null );
    const [selectedEmployee, setSelectedEmployee] = useState( null );

    const [action, setAction] = useState( null );
    // action = { type: 'edit' | 'job' | 'transfer', row }

    const [transferOpen, setTransferOpen] = useState( false );
    const [transferRow, setTransferRow] = useState( false );

    const openMenu = ( e, employee ) => {
        setMenuAnchorEl( e.currentTarget );
        setSelectedEmployee( employee );
    };
    const closeMenu = () => {
        setMenuAnchorEl( null );
        setSelectedEmployee( null );
    };

    const handleChangePage = ( event, newPage ) => { setPage( newPage ); };
    const handleChangeRowsPerPage = ( event ) => { setRowsPerPage( parseInt( event.target.value, 10 ) ); setPage( 0 ); };

    const handleTransferRequest = ( row ) => {
        setTransferRow( row );
        setTransferOpen( true );
    };

    useEffect( () => {
        setPage( 0 );
    }, [filters] );

    const filteredEmployees = useMemo( () => {
        return empRecords.filter( ( data ) => {
            //Office Filter
            if ( filters.office !== "all" && String( data.current_office_id ) !== String( filters.office ) ) {
                return false;
            }
            //Employee type
            if ( filters.empType !== "all" && data.emp_type !== filters.empType ) { return false; }
            //JD Status
            if ( filters.jd !== "all" && data.jd !== filters.jd ) { return false; }
            //Chief Status
            if ( filters.is_chief !== "all" && data.is_office_chief !== filters.is_chief ) { return false; }
            //Post
            if ( filters.post && filters.post !== "all" && data.post_id !== filters.post ) { return false; }
            //Sanket number
            if ( filters.sanket_no &&
                !data.sanket_no?.toLowerCase().includes( filters.sanket_no.toLowerCase() )
            ) { return false; }
            //Name Search
            if ( filters.search ) {
                const searchText = filters.search.toLowerCase();
                const combined = `${ data.name_in_nepali } ${ data.name_in_english }`.toLowerCase();

                if ( !combined.includes( searchText ) ) {
                    return false;
                }
            }
            return true;
        } );
    }, [empRecords, filters] );

    const closeJobDialog = () => {
        setJobDialogOpen( false );
        setSelectedJob( null );
        setJobDialogMode( "add" );
    };

    return (
        <>
            <Helmet>
                <title>PMIS: सबै कर्मचारी</title>
            </Helmet>
            <Button onClick={() => exportToExcel( filteredEmployee )} variant="outlined" color="primary" sx={{ m: 1 }}>
                एक्सेल निर्यात
            </Button>
            <EmpTableFilters onChange={setFilters} />
            <TableContainer sx={{ maxHeight: "70vh" }}>
                <Table size="small" stickyHeader border={1}>
                    <TableHead >
                        <TableRow>
                            <TableCell rowSpan={2}>सि. नं.</TableCell>
                            <TableCell rowSpan={2}>कार्यालय</TableCell>

                            <TableCell colSpan={5} align="center">
                                कर्मचारी विवरण
                            </TableCell>

                            <TableCell colSpan={2} align="center">
                                सुरु नियुक्ति विवरण
                            </TableCell>

                            <TableCell colSpan={5} align="center">
                                हालको पदमा नियुक्ति पदस्थापन वा हाजिर
                            </TableCell>

                            <TableCell rowSpan={2}>#</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell>प्रकार</TableCell>
                            <TableCell>क.स.नं.</TableCell>
                            <TableCell>नाम</TableCell>
                            <TableCell>सम्पर्क</TableCell>
                            <TableCell>फोटो</TableCell>

                            <TableCell>पद</TableCell>
                            <TableCell>नियुक्ति मिति</TableCell>

                            <TableCell>प्रक्रिया</TableCell>
                            <TableCell>मिति</TableCell>
                            <TableCell>हाजिर मिति</TableCell>
                            <TableCell>सेवा समूह/श्रेणी</TableCell>
                            <TableCell>पद</TableCell>
                        </TableRow>
                    </TableHead>


                    <TableBody>
                        {/* {empRecords */}
                        {filteredEmployees
                            .slice( page * rowsPerPage, page * rowsPerPage + rowsPerPage )
                            .map( ( data, index ) => {
                                return (
                                    <Fragment key={data.id}>
                                        <TableRow>
                                            {/* <TableCell > {index + 1} </TableCell> */}
                                            <TableCell > {page * rowsPerPage + index + 1} </TableCell>
                                            <TableCell > {data?.current_office_np} </TableCell>
                                            <TableCell > {data?.emp_type} </TableCell>
                                            <TableCell > {data?.sanket_no} </TableCell>
                                            <TableCell > {data?.name_in_nepali} </TableCell>
                                            <TableCell > {data?.mobile_no} <br /> {data?.email} </TableCell>
                                            <TableCell >
                                                <img
                                                    // src={`${ BASE_URL }${ data.photo_path }`}
                                                    src={`${ BASE_URL }${ data.photo_path }`}
                                                    alt="बन्दी"
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: "50%",
                                                        cursor: "pointer",
                                                        objectFit: "cover",
                                                    }}
                                                    onClick={() =>
                                                        Swal.fire( {
                                                            imageUrl: `${ BASE_URL }${ data.photo_path }`,
                                                            imageAlt: "बन्दी फोटो",
                                                            showConfirmButton: false,
                                                        } )
                                                    }
                                                /> </TableCell>
                                            <TableCell > {data?.designation} </TableCell>
                                            <TableCell > {data?.join_date} </TableCell>
                                            <TableCell > {data?.jd} {data?.jd === 'काज' && data?.kaaj_office_np} </TableCell>
                                            <TableCell > {data?.appointment_date_bs} </TableCell>
                                            <TableCell > {data?.hajir_miti_bs} </TableCell>
                                            <TableCell > {data?.service_name_np}/ {data?.group_name_np}/ {data?.level_name_np}</TableCell>
                                            <TableCell > {data?.post_name_np} </TableCell>

                                            <TableCell sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

                                                <IconButton
                                                    onClick={( e ) =>
                                                        openMenu( e, data )
                                                    }

                                                >
                                                    <MoreVertIcon />
                                                </IconButton>

                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                );
                            } )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean( menuAnchorEl )}
                onClose={closeMenu}
            >
                {selectedEmployee && (
                    <EmpActionMenu
                        employee={selectedEmployee}
                        onEdit={( row ) => setAction( { type: 'edit', row } )}
                        onJob={( row ) => setAction( { type: 'job', row } )}
                        onTransfer={( row ) => setAction( { type: 'transfer', row } )}
                        onClose={closeMenu}

                    />

                )}
            </Menu>
            {/* <Box>जम्मा: {totalKaidi}</Box> */}
            {/* <PayroleTableFilters onChange={( newFilters ) => setFilters( newFilters )} /> */}


            <TablePagination
                rowsPerPageOptions={[25, 50, 100, 500]}
                component="div"
                count={filteredEmployees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Edit Job / JD */}
            {action?.type === "job" && (
                <EditJobDetailDialog
                    open
                    mode="edit"
                    jobData={action.row}
                    employeeId={action.row.emp_id || action.row.id}
                    onClose={() => setAction( null )}
                    onSaved={() => {
                        setAction( null );
                        refetchEmp();
                    }}
                />
            )}

            {/* Transfer */}
            {action?.type === "transfer" && (
                <TransferEmployeeDialog
                    open
                    employee={action.row}
                    onClose={() => setAction( null )}
                    onTransferred={() => {
                        setAction( null );
                        refetchEmp();
                    }}
                />
            )}

        </>
    );
};

export default AllEmployeTable;
