import { useEffect, useState } from "react";
import {
  InputLabel,
  Button,
  Box,
  Typography,
  Avatar,
  Dialog
} from "@mui/material";
import { Controller } from "react-hook-form";
import PhotoIcon from "@mui/icons-material/Photo";
import { Person } from "@mui/icons-material";
import imageCompression from "browser-image-compression";

const ReusePhotoInput = ({
  name,
  label,
  required,
  control,
  error,
  defaultValue,
  showPreview = true,
  maxSizeMB = 0.5,
}) => {
  const [fileName, setFileName] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  // ✅ Existing image (edit mode)
  useEffect(() => {
    if (typeof defaultValue === "string") {
      setFileName(defaultValue.split("/").pop());
      setPreviewUrl(defaultValue);
    }
  }, [defaultValue]);

  const handleFileChange = async (e, onChange) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // ✅ Compress if needed
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      try {
        file = await imageCompression(file, {
          maxSizeMB,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
      } catch (err) {
        console.error("Image compression failed", err);
      }
    }

    setFileName(file.name);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    onChange(file); // ⚠️ unchanged behavior
  };

  const handleRemove = (onChange) => {
    setFileName(null);
    setPreviewUrl(null);
    onChange(null);
  };

  // ✅ Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || null}
      rules={{
        ...(required && {
          required: { value: true, message: "Required" },
        }),
      }}
      render={({ field: { onChange } }) => (
        <Box mt={1}>
          <InputLabel>
            {label}
            {required && "*"}
          </InputLabel>

          {/* ✅ Preview */}
          {showPreview && (
            <>
              <Avatar
                variant="rounded"
                src={previewUrl || undefined}
                sx={{
                  width: 150,
                  height: 150,
                  mb: 1,
                  cursor: previewUrl ? "pointer" : "default",
                }}
                onClick={() => previewUrl && setZoomOpen(true)}
              >
                {!previewUrl && <Person sx={{ fontSize: 60 }} />}
              </Avatar>

              {/* 🔍 Zoom Dialog */}
              <Dialog open={zoomOpen} onClose={() => setZoomOpen(false)}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                />
              </Dialog>
            </>
          )}

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <PhotoIcon color="primary" />
            <Typography>
              {fileName || "No Image selected"}
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Button variant="contained" component="label">
              {fileName ? "Change Image" : "Choose Image"}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, onChange)}
              />
            </Button>

            {fileName && (
              <Button
                color="error"
                onClick={() => handleRemove(onChange)}
              >
                Remove
              </Button>
            )}
          </Box>

          {error && (
            <Typography color="error" variant="body2">
              {error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
};

export default ReusePhotoInput;
