import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import { createJobDetail, updateJobDetail, deleteJobDetail } from '../services/employeeService';
import usePosts from '../APIs/usePosts';
import useOnlineOffices from '../../ReuseableComponents/fetchUserStatus';

const EditJobDetailDialog = ({ open, onClose, mode = 'add', jobData = null, employeeId, onSaved }) => {
  const { posts, optPosts, postsloading } = usePosts();
  const { records: offices, optrecords, loading: officesLoading } = useOnlineOffices();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && jobData) {
      setForm({
        jd: jobData.jd || '',
        appointment_date_bs: jobData.appointment_date_bs || '',
        hajir_miti_bs: jobData.hajir_miti_bs || '',
        post_id: jobData.post_id || '',
        current_office_id: jobData.current_office_id || '',
        emp_group: jobData.service_group_id || '',
        emp_level: jobData.level_id || '',
        is_chief: jobData.is_office_chief || '',
        remarks: jobData.remarks || ''
      });
    } else {
      setForm({ jd: '', appointment_date_bs: '', hajir_miti_bs: '', post_id: '', current_office_id: '', emp_group: '', emp_level: '', is_chief: '', remarks: '' });
    }
  }, [open, mode, jobData]);

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        jd: form.jd,
        appointment_date_bs: form.appointment_date_bs,
        hajir_miti_bs: form.hajir_miti_bs,
        post_id: form.post_id,
        current_office_id: form.current_office_id,
        emp_group: form.emp_group,
        emp_level: form.emp_level,
        is_chief: form.is_chief,
        remarks: form.remarks
      };

      let res;
      if (mode === 'add') {
        res = await createJobDetail(employeeId, payload);
      } else {
        // editing existing jobData -> update specific job row
        res = await updateJobDetail(jobData.id, payload);
      }

      if (res && res.success) {
        Swal.fire('Success', mode === 'add' ? 'Job added' : 'Job updated', 'success');
        onSaved && onSaved();
        onClose();
      } else {
        Swal.fire('Error', res?.message || 'Save failed', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!jobData?.id) return;
    const confirm = await Swal.fire({ title: 'Confirm', text: 'Delete this job entry?', icon: 'warning', showCancelButton: true });
    if (!confirm.isConfirmed) return;
    try {
      const res = await deleteJobDetail(jobData.id);
      if (res && res.success) {
        Swal.fire('Deleted', 'Job entry deleted', 'success');
        onSaved && onSaved();
        onClose();
      } else {
        Swal.fire('Error', res?.message || 'Delete failed', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err?.message || 'Delete failed', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'add' ? 'Add Job Detail' : 'Edit Job Detail'}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField select label="JD" fullWidth size="small" value={form.jd || ''} onChange={handleChange('jd')}>
                <MenuItem value="">-- Select --</MenuItem>
                <MenuItem value="नयाँ नियुक्ती">नयाँ नियुक्ती</MenuItem>
                <MenuItem value="सरुवा">सरुवा</MenuItem>
                <MenuItem value="काज">काज</MenuItem>
                <MenuItem value="बढुवा">बढुवा</MenuItem>
                <MenuItem value="पदस्थापन">पदस्थापन</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Appointment Date (BS)" fullWidth size="small" value={form.appointment_date_bs || ''} onChange={handleChange('appointment_date_bs')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Hajir Miti (BS)" fullWidth size="small" value={form.hajir_miti_bs || ''} onChange={handleChange('hajir_miti_bs')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              {officesLoading ? (
                <CircularProgress size={20} />
              ) : (
                <TextField select label="Office" fullWidth size="small" value={form.current_office_id || ''} onChange={handleChange('current_office_id')}>
                  <MenuItem value="">-- Select Office --</MenuItem>
                  {optrecords && optrecords.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {postsloading ? (
                <CircularProgress size={20} />
              ) : (
                <TextField select label="Post" fullWidth size="small" value={form.post_id || ''} onChange={handleChange('post_id')}>
                  <MenuItem value="">-- Select Post --</MenuItem>
                  {optPosts && optPosts.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField label="Remarks" fullWidth size="small" value={form.remarks || ''} onChange={handleChange('remarks')} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {mode === 'edit' && (
          <Button color="error" onClick={handleDelete}>Delete</Button>
        )}
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditJobDetailDialog;
