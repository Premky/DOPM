import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Avatar, Stack
} from '@mui/material';

const UpdatePhotoModal = ({ open, onClose, onSave, currentPhoto }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      onSave(formData); // You handle upload API outside
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>फोटो अपडेट गर्नुहोस्</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" mt={1}>
          <Avatar
            src={previewURL || currentPhoto}
            alt="Preview"
            sx={{ width: 150, height: 150 }}
          />
          <Button variant="contained" component="label">
            फोटो छान्नुहोस्
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>रद्द गर्नुहोस्</Button>
        <Button variant="contained" onClick={handleSave} disabled={!selectedFile}>
          सेभ गर्नुहोस्
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePhotoModal;