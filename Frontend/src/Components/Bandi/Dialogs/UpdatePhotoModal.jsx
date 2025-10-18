import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Avatar, Stack, Alert
} from '@mui/material';
import imageCompression from 'browser-image-compression';

const UpdatePhotoModal = ({ open, onClose, onSave, currentPhoto, bandiMeta }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setErrorMessage('');
    setLoading(true);

    try {
      let finalFile = file;

      // ✅ If file is larger than 1MB, compress it
      if (file.size > 1 * 1024 * 1024) {
        const options = {
          maxSizeMB: 1,            // Target under 1MB
          maxWidthOrHeight: 1024,  // Resize if needed
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        finalFile = compressedFile;
      }

      setSelectedFile(finalFile);
      setPreviewURL(URL.createObjectURL(finalFile));
    } catch (err) {
      console.error(err);
      setErrorMessage('फोटो कम्प्रेस गर्दा त्रुटि भयो।');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setErrorMessage('फोटो छान्नुहोस्।');
      return;
    }

    const formData = new FormData();
    formData.append('office_bandi_id', bandiMeta.office_bandi_id);
    formData.append('bandi_name', bandiMeta.bandi_name);
    formData.append('photo', selectedFile);

    try {
      setLoading(true);
      await onSave(formData); // handle upload outside
      onClose();
    } catch (error) {
      const backendMsg = error?.response?.data?.message || 'अपलोड गर्दा त्रुटि भयो।';
      setErrorMessage(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>फोटो अपडेट गर्नुहोस्</DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" mt={1}>
          <Avatar
            src={previewURL || currentPhoto}
            alt="Preview"
            sx={{ width: 300, height: 300 }}
          />

          <Button variant="contained" component="label" disabled={loading}>
            {loading ? 'कृपया पर्खनुहोस्...' : 'फोटो छान्नुहोस्'}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          {errorMessage && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {errorMessage}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>रद्द गर्नुहोस्</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!selectedFile || loading}
        >
          सेभ गर्नुहोस्
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePhotoModal;
