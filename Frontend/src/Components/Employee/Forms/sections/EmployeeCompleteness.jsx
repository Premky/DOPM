import { Box, LinearProgress, Typography } from "@mui/material";

const fields = [
  "name_in_nepali",
  "name_in_english",
  "mobile_no",
  "citizenship_no",
  "dob",
  "jobDetails",
  "address"
];

const EmployeeCompleteness = ({ employee }) => {
  const filled = fields.filter(f => employee[f]).length;
  const percent = Math.round((filled / fields.length) * 100);

  return (
    <Box mt={2}>
      <Typography variant="body2">
        प्रोफाइल पूर्णता: {percent}%
      </Typography>
      <LinearProgress
        value={percent}
        variant="determinate"
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
};

export default EmployeeCompleteness;
