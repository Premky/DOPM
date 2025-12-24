import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box
} from "@mui/material";
import StatusChip from "./StatusChip";

const MobileParoleCard = ({ row }) => {
  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Typography fontWeight={600}>
          {row.bandi_name}
        </Typography>

        <Typography variant="body2">
          ID: {row.office_bandi_id}
        </Typography>

        <Box sx={{ my: 1 }}>
          <StatusChip status={row.status} />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography variant="body2">
          कारागार: {row.letter_address}
        </Typography>

        <Typography variant="body2">
          मुद्दा संख्या: {row.mudda_count}
        </Typography>

        <Typography variant="body2">
          छुट मिति: {row.release_date_bs}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MobileParoleCard;
