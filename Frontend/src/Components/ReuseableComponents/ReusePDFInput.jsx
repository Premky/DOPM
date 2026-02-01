import { useEffect, useState } from "react";
import { InputLabel, Button, Box, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { usePdfFilePolicy } from "./filePolicies/usePdfFilePolicy";

const ReusePdfInput = ({
  name,
  label,
  required,
  control,
  error,
  defaultValue,
  sizePerPageMB = 0.5,
  rejectEncrypted = true,
  rejectScanned = false,
}) => {
  const [fileName, setFileName] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [existingUrl, setExistingUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const { validatePdf } = usePdfFilePolicy({
    sizePerPageMB,
    rejectEncrypted,
    rejectScanned,
  });

  return (
    <>
      <InputLabel id={name}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || null}
        rules={{
          ...(required && {
            required: { value: true, message: "PDF फाइल अनिवार्य छ" },
          }),
        }}
        render={({ field: { onChange, value } }) => {
          const handleChange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploadError("");
            setLoading(true);

            try {
              const { pages } = await validatePdf(file);
              setFileName(file.name);
              setPageCount(pages);
              setExistingUrl(null);
              onChange(file); // ✅ store single File object
            } catch (err) {
              setUploadError(err.message);
              onChange(null);
            } finally {
              setLoading(false);
            }
          };

          useEffect(() => {
            if (typeof value === "string") {
              setExistingUrl(value);
              setFileName(value.split("/").pop());
              setPageCount(null);
            } else if (value instanceof File) {
              setFileName(value.name);
            }
          }, [value]);

          return (
            <Box mt={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <PictureAsPdfIcon color="error" />
                <Typography variant="body2">
                  {fileName || "PDF छानिएको छैन"}
                </Typography>
              </Box>

              {pageCount && (
                <Typography variant="body2" color="text.secondary">
                  कुल पृष्ठ: {pageCount}
                </Typography>
              )}

              {existingUrl && (
                <Typography variant="body2" mt={1}>
                  <a href={existingUrl} target="_blank" rel="noopener noreferrer">
                    हालको PDF हेर्नुहोस्
                  </a>
                </Typography>
              )}

              <Button
                variant="contained"
                component="label"
                size="small"
                sx={{ mt: 1 }}
                disabled={loading}
              >
                {loading
                  ? "कृपया पर्खनुहोस्..."
                  : fileName
                  ? "PDF परिवर्तन गर्नुहोस्"
                  : "PDF छान्नुहोस्"}
                <input
                  hidden
                  type="file"
                  accept="application/pdf"
                  onChange={handleChange}
                />
              </Button>

              {fileName && !loading && (
                <Button
                  size="small"
                  color="error"
                  sx={{ ml: 1, mt: 1 }}
                  onClick={() => {
                    setFileName(null);
                    setPageCount(null);
                    setExistingUrl(null);
                    onChange(null);
                  }}
                >
                  हटाउनुहोस्
                </Button>
              )}

              {(error || uploadError) && (
                <Typography color="error" variant="body2" mt={1}>
                  {uploadError || error?.message}
                </Typography>
              )}
            </Box>
          );
        }}
      />
    </>
  );
};

export default ReusePdfInput;
