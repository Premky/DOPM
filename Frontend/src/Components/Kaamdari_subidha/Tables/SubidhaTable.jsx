import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { useBaseURL } from "../../../Context/BaseURLProvider";
import { useAuth } from "../../../Context/AuthContext";
import { calculateBSDate } from "../../../../Utils/dateCalculator";
import { calculateTotalConcession } from "../../../../Utils/calculateTotalConcession";

import useBandiRanks from "../../ReuseableComponents/useBandiRanks";
import InternalAdminModal from "../Modals/InternalAdminModal";

import ReuseKaragarOffice from "../../ReuseableComponents/ReuseKaragarOffice";
import ReuseBandiRanks from "../../ReuseableComponents/ReuseBandiRanks";
import ReuseableTable from "../../ReuseableComponents/ReuseTable";

const AantarikPrashasanTable = () => {
    const BASE_URL = useBaseURL();
    const { state: authState } = useAuth();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState( false );
    const [editingData, setEditingData] = useState( null );
    const [bandies, setBandies] = useState( [] );
    const { ranks, loading } = useBandiRanks();

    const {
        control,
        setValue,
        formState: { errors },
    } = useForm( {
        defaultValues: {
            office_id: "",
            bandi_rank_id: "",
        },
    } );

    // Set office_id from auth on load
    useEffect( () => {
        if ( authState?.office_id !== undefined ) {
            setValue( "office_id", Number( authState.office_id ) );
        }
    }, [authState?.office_id, setValue] );


    // Open modal to edit existing record
    const handleEdit = ( data ) => {
        setEditingData( data );
        setModalOpen( true );
    };

    // Handle View 
    const handleView = ( data ) => {
        // console.log(data)
        navigate( `/kaamdari_subidha/view_detials/${ data.bia_id }` );
    };

    // Open modal to add new record with optional bandi_id
    const handleAdd = ( bandi_id = null ) => {
        setEditingData( bandi_id ? { bandi_id } : null );
        setModalOpen( true );
    };

    const columns = [
        { field: "bandi_name", headerName: "पद", width: 100 },

        { field: "bandi_address", headerName: "दैनिक", width: 100 },
        { field: "mudda_name", headerName: "मासिक", width: 100 },
        { field: "thuna_date_bs", headerName: "वार्षिक", width: 100 },

        { field: "bandi_address", headerName: "दैनिक", width: 100 },
        { field: "mudda_name", headerName: "मासिक", width: 100 },
        { field: "thuna_date_bs", headerName: "वार्षिक", width: 100 },
        // Add more fields as necessary
    ];

    const rows = bandies.map( ( b ) => ( {
        // const duration = calculateBSDate(b.appointment_start_date_bs, b.appointment_end_date_bs),
        ...b,
        id: b.bandi_id,
        bandi_address: b.nepali_address || b.bidesh_nagarik_address_details,
        // duration: b.facility_years || 0 + '|' + b.facility_months || 0 + '|' + b.faciltiy_days || 0,
        duration: `${ b.facility_years || 0 }|${ b.facility_months || 0 }|${ b.facility_days || 0 }`,
        facility:
            b.appointment_start_date_bs && b.appointment_end_date_bs
                ? calculateTotalConcession(
                    calculateBSDate( b.appointment_start_date_bs, b.appointment_end_date_bs ),
                    ranks,
                    b.internal_admin_post_id
                )?.formatted || ''
                : null,
        office: b.office_name,
        current_office_id: b.current_office
    } ) );


    return (
        <Box p={2}>
            <InternalAdminModal
                open={modalOpen}
                onClose={() => setModalOpen( false )}
                onSave={handleSave}
                editingData={editingData}
            />

            <Grid container spacing={2} alignItems="center" mb={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="h6">आन्तरिक प्रशासन दाखिला</Typography>
                </Grid>

                <Grid item xs={12} sm={6} textAlign="right">
                    <Button variant="contained" onClick={() => handleAdd()}>
                        थप्नुहोस्
                    </Button>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Controller
                        name="office_id"
                        control={control}
                        render={( { field } ) => (
                            <ReuseKaragarOffice
                                {...field}
                                label="कार्यालय"
                                control={control}
                                error={errors.office_id}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Controller
                        name="bandi_rank_id"
                        control={control}
                        render={( { field } ) => (
                            <ReuseBandiRanks
                                {...field}
                                label="पद"
                                control={control}
                                error={errors.bandi_rank_id}
                            />
                        )}
                    />
                </Grid>
            </Grid>

            {/* TODO: Render your data table here using `bandies` with edit buttons calling handleEdit */}

            <ReuseableTable
                columns={columns}
                rows={rows}
                // showView
                showEdit
                // showDelete
                onView={handleView}
                onEdit={handleEdit}
                // onDelete{handleDelete}
                enableExport
                includeSerial
                serialLabel="सि.नं."
            />
        </Box>
    );
};

export default AantarikPrashasanTable;
