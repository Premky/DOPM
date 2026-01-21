import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress
} from '@mui/material';
import Swal from 'sweetalert2';
import usePosts from '../APIs/usePosts';
import useOnlineOffices from '../../ReuseableComponents/fetchUserStatus';
import { transferEmployee } from '../services/employeeService';

const TransferEmployeeDialog = ({ open, onClose, employee, onTransferred }) => {
  const { posts, optPosts, postsloading } = usePosts();
  const { records: offices, optrecords, loading: officesLoading } = useOnlineOffices();

  const [targetOffice, setTargetOffice] = useState('');
  const [targetPost, setTargetPost] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!employee || !employee.emp_id) return;
    setSaving(true);
    try {
      const payload = {
        target_office_id: targetOffice || null,
        target_post_id: targetPost || null,
        effective_date: effectiveDate || null,
        notes: notes || null
      };

      const result = await transferEmployee(employee.emp_id, payload);
      if (result && result.success) {
        Swal.fire('Success', 'Employee transferred successfully', 'success');
        onTransferred && onTransferred();
        onClose();
      } else {
        Swal.fire('Error', result?.message || 'Transfer failed', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err?.message || 'Transfer failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Transfer Employee</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            {officesLoading ? (
              <CircularProgress size={20} />
            ) : (
              <TextField
                select
                label="Target Office"
                value={targetOffice}
                onChange={(e) => setTargetOffice(e.target.value)}
                fullWidth
                size="small"
              >
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
              <TextField
                select
                label="Target Post"
                value={targetPost}
                onChange={(e) => setTargetPost(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">-- Select Post --</MenuItem>
                {optPosts && optPosts.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Effective Date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={saving}>
          {saving ? 'Transferring...' : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferEmployeeDialog;
