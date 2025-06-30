import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import { useBaseURL } from "../../../../Context/BaseURLProvider";
import { useAuth } from "../../../../Context/AuthContext";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import { calculateTotalConcession } from "../../../../../Utils/calculateTotalConcession";

import useBandiRanks from "../../../ReuseableComponents/useBandiRanks";
import InternalAdminModal from "../Modals/InternalAdminModal";

import ReuseKaragarOffice from "../../../ReuseableComponents/ReuseKaragarOffice";
import ReuseBandiRanks from "../../../ReuseableComponents/ReuseBandiRanks";
import ReuseableTable from "../../../ReuseableComponents/ReuseTable";

const AantarikPrashasanTable = () => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [bandies, setBandies] = useState([]);
  const { ranks, loading } = useBandiRanks();

  const {
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      office_id: "",
      bandi_rank_id: "",
    },
  });

  // Set office_id from auth on load
  useEffect(() => {
    if (authState?.office_id !== undefined) {
      setValue("office_id", Number(authState.office_id));
    }
  }, [authState?.office_id, setValue]);

  // Fetch bandies or internal admin data (implement your own endpoint)
  const fetchBandies = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/bandi/get_all_internal_admin`,
        { withCredentials: true }
      );
      setBandies(response.data.Result || []);
      // console.log(response.data.Result)
    } catch (error) {
      console.error("Failed to fetch bandies:", error);
    }
  };

  useEffect(() => {
    fetchBandies();
  }, []);

  // Open modal to edit existing record
  const handleEdit = (data) => {
    setEditingData(data);
    setModalOpen(true);
  };

  // Handle View 
  const handleView = (data) => {
    // console.log(data)
    navigate(`/kaamdari_subidha/view_detials/${data.bia_id}`)
  };

  // Open modal to add new record with optional bandi_id
  const handleAdd = (bandi_id = null) => {
    setEditingData(bandi_id ? { bandi_id } : null);
    setModalOpen(true);
  };

  // Save handler passed to modal
  const handleSave = async (formData, id) => {
    try {
      // Validate JSON serializability
      JSON.stringify(formData);
    } catch (e) {
      console.error("Data contains circular reference:", e);
      return Swal.fire("त्रुटि!", "डेटा सुरक्षित गर्न सकिएन।", "error");
    }

    try {
      if (id) {
        await axios.put(
          `${BASE_URL}/bandi/update_internal_admin/${id}`,
          formData,
          { withCredentials: true }
        );
        Swal.fire("सफल भयो!", "डेटा अपडेट गरियो", "success");
      } else {
        if (!formData.bandi_id) {
          return Swal.fire("त्रुटि!", "Bandi ID हराइरहेको छ ।", "error");
        }
        await axios.post(
          `${BASE_URL}/bandi/add_internal_admin`,
          formData,
          { withCredentials: true }
        );
        Swal.fire("सफल भयो!", "नयाँ डेटा थपियो ।", "success");
      }
      setModalOpen(false);
      fetchBandies();
    } catch (error) {
      console.error("handleSave error:", error);
      Swal.fire(
        "त्रुटि!",
        error.response?.data?.Error || error.message || "सर्भर अनुरोध असफल भयो ।",
        "error"
      );
    }
  };


  const columns = [
    { field: "bandi_name", headerName: "बन्दीको नामथर", width: 100 },
    { field: "bandi_address", headerName: "ठेगाना", width: 100 },
    { field: "mudda_name", headerName: "मुद्दा", width: 100 },
    { field: "thuna_date_bs", headerName: "कैद परेको मिति", width: 100 },
    { field: "release_date_bs", headerName: "कैदी पुर्जीमा उल्लेखित छुटि जाने मिति", width: 100 },
    { field: "internal_admin_post_id", headerName: "पद", width: 100 },
    { field: "appointment_start_date_bs", headerName: "सुरु नियुक्ति मिति (वि.सं.)", width: 150 },
    { field: "appointment_end_date_bs", headerName: "समाप्त मिति (वि.सं.)", width: 180 },
    { field: "duration", headerName: "अवधी", width: 100 },
    { field: "facility", headerName: "पाएको सुविधा", width: 100 },
    { field: "office", headerName: "कार्यालय", width: 100 },
    { field: "chalani_no", headerName: "चलानी नं", width: 100 },
    { field: "chalani_date", headerName: "चलानी मिति", width: 130 },
    { field: "remarks", headerName: "कैफियत", width: 130 },
    { field: "current_office_id", headerName: "हालको कारागार", width: 130 },
    // Add more fields as necessary
  ];

  const rows = bandies.map((b) => ({
    // const duration = calculateBSDate(b.appointment_start_date_bs, b.appointment_end_date_bs),
    ...b,
    id: b.bandi_id,
    bandi_address: b.nepali_address || b.bidesh_nagarik_address_details,
    duration: b.facility_years || 0 + '|' + b.facility_months || 0 + '|' + b.faciltiy_days || 0,
    duration: `${b.facility_years || 0}|${b.facility_months || 0}|${b.facility_days || 0}`,
    facility:
      b.appointment_start_date_bs && b.appointment_end_date_bs
        ? calculateTotalConcession(
          calculateBSDate(b.appointment_start_date_bs, b.appointment_end_date_bs),
          ranks,
          b.internal_admin_post_id
        )?.formatted || ''
        : null,
    office: b.office_name,
    current_office_id: b.current_office
  }))


  return (
    <Box p={2}>
      <InternalAdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
            render={({ field }) => (
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
            render={({ field }) => (
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
        showView
        showEdit
        showDelete
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
