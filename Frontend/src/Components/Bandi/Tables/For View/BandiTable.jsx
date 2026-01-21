import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonIcon from '@mui/icons-material/Person';
import Swal from 'sweetalert2';

import { useBaseURL } from '../../../../Context/BaseURLProvider';
import BandiEditModal from '../../Dialogs/BandiEditModa';
import UpdatePhotoModal from '../../Dialogs/UpdatePhotoModal';

/**
 * UI-only conversion of BandiTable → Detail View layout
 * (pattern inspired by EmployeeDetailView)
 */

const InfoBlock = ({ label, value }) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value || 'N/A'}
    </Typography>
  </Box>
);

const BandiTable = ({ bandi_id }) => {
  const BASE_URL = useBaseURL();

  const [bandi, setBandi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const fetchBandi = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/bandi/get_bandi/${bandi_id}`);
      if (res.data?.Status && res.data.Result?.length) {
        setBandi(res.data.Result[0]);
      } else {
        setBandi(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bandi_id) fetchBandi();
  }, [bandi_id]);

  const handleSave = async (formData) => {
    try {
      await axios.put(
        `${BASE_URL}/bandi/update_bandi/${formData.bandi_id}`,
        formData,
        { withCredentials: true }
      );
      Swal.fire('सफल भयो!', 'डेटा अपडेट गरियो', 'success');
      fetchBandi();
    } catch {
      Swal.fire('त्रुटि!', 'अपडेट गर्न सकिएन', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!bandi) {
    return (
      <Typography align="center" color="error">
        बन्दी विवरण भेटिएन
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <BandiEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editingData={bandi}
        onSave={handleSave}
      />

      <UpdatePhotoModal
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        currentPhoto={bandi.photo_path ? `${BASE_URL}${bandi.photo_path}` : ''}
        bandiMeta={{
          office_bandi_id: bandi.office_bandi_id,
          bandi_name: bandi.bandi_name
        }}
        onSave={async (formData) => {
          try {
            await axios.put(
              `${BASE_URL}/bandi/update_bandi_photo/${bandi.bandi_id}`,
              formData,
              { withCredentials: true }
            );
            Swal.fire('सफल भयो!', 'फोटो अपडेट गरियो', 'success');
            fetchBandi();
          } catch {
            Swal.fire('त्रुटि!', 'फोटो अपडेट असफल', 'error');
          }
        }}
      />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          बन्दी विवरण
        </Typography>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={() => setEditOpen(true)}
        >
          सम्पादन
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile */}
        <Grid size={{xs:12, md:4}}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={bandi.photo_path ? `${BASE_URL}${bandi.photo_path}` : undefined}
                sx={{ width: 140, height: 140, mx: 'auto', mb: 2, cursor: 'pointer' }}
                onClick={() => setPhotoOpen(true)}
                variant="rounded"
              >
                <PersonIcon sx={{ fontSize: 80 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {bandi.bandi_name}
              </Typography>
              <Typography color="text.secondary">
                {bandi.bandi_name_en}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 1 }}>
                ID: {bandi.office_bandi_id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Details */}
        <Grid size={{xs:12, md:8}} >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              व्यक्तिगत जानकारी
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="बन्दी प्रकार" value={bandi.bandi_type} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="लिङ्ग" value={bandi.gender === 'Male' ? 'पुरुष' : bandi.gender === 'Female' ? 'महिला' : 'अन्य'} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="जन्म मिति / उमेर" value={`${bandi.dob} (${bandi.current_age} वर्ष)`} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="वैवाहिक अवस्था" value={bandi.married_status} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="दाखिला मिति" value={bandi.enrollment_date_bs} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="ब्लक नं." value={bandi.block_name} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="शैक्षिक योग्यता" value={bandi.bandi_education} />
              </Grid>
              <Grid size={{xs:12, sm:6}}>
                <InfoBlock label="हुलिया" value={bandi.bandi_huliya} />
              </Grid>
            </Grid>

            {bandi.remarks && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight={600} mb={1}>
                  कैफियत
                </Typography>
                <Typography>{bandi.remarks}</Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BandiTable;