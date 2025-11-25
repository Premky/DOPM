import React from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";

export default function MiniDrawerPreview({ menus }) {
  const renderMenu = (menu, level = 0) => (
    <React.Fragment key={menu.id}>
      <ListItem sx={{ pl: level * 3, borderBottom: "1px solid #eee" }}>
        <ListItemText primary={menu.title} />
      </ListItem>
      {menu.children?.map((child) => renderMenu(child, level + 1))}
    </React.Fragment>
  );

  return (
    <Paper sx={{ p: 2, bgcolor: "grey.100" }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Sidebar Preview (Mock)
      </Typography>
      <Box sx={{ width: 250, border: "1px solid #ddd", borderRadius: 1, bgcolor: "white" }}>
        <List dense>
          {menus.map((m) => renderMenu(m))}
        </List>
      </Box>
    </Paper>
  );
}
