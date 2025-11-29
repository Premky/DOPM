import React, { useEffect, useRef } from "react";
import $ from "jquery";
import { Controller } from "react-hook-form";
import { Box, InputLabel, Typography } from "@mui/material";
import "@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.css";

window.$ = window.jQuery = $;

const ReuseDatePickerSMV5 = ({
  control,
  name,
  label,
  required = false,
  defaultValue = "",
  options = { miniEnglishDates: true },
  maxDate,
  open
}) => {
  const inputRef = useRef(null);
  const initializedRef = useRef(false);

  // ----------------------------
  // 1️⃣ INIT DATE PICKER
  // ----------------------------
  useEffect(() => {
    let mounted = true;

    import("@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.js")
      .then(() => {
        if (
          mounted &&
          inputRef.current &&
          !initializedRef.current &&
          typeof $(inputRef.current).NepaliDatePicker === "function"
        ) {
          $(inputRef.current).NepaliDatePicker({
            ...options,
            ...(maxDate && { maxDate }),
            onChange: (value) => {
              // Sync back to react-hook-form
              inputRef.current.value = value;
              inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
            }
          });

          initializedRef.current = true;
        }
      })
      .catch((err) => console.error("Datepicker load failed:", err));

    return () => (mounted = false);
  }, [open, options, maxDate]);

  // Reset plugin when dialog re-opens
  useEffect(() => {
    if (!open) initializedRef.current = false;
  }, [open]);

  return (
    <>
      <InputLabel id={name} sx={{ mb: 1, display: "block" }}>
        {label}
        {required && <span style={{ color: "red" }}>*</span>}
      </InputLabel>

      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{
          ...(required && { required: "यो फिल्ड अनिवार्य छ" })
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Box sx={{ mb: 2, mt: 1 }}>
            
            {/* 👇 MOST IMPORTANT FIX — controlled value */}
            <input
              ref={inputRef}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}  // sync text input
              onBlur={() => onChange(inputRef.current.value)} // sync plugin value
              type="text"
              placeholder="YYYY-MM-DD"
              autoComplete="off"
              className="nepali-datepicker-input"
            />

            <style>{`
              .nepali-datepicker-input {
                width: 100%;
                padding: 10.5px 14px;
                font-size: 0.875rem;
                border-radius: 4px;
                border: 1px solid ${error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)"};
                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
              }
            `}</style>

            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                {error.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </>
  );
};

export default ReuseDatePickerSMV5;
