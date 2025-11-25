// src/Components/Nav/MiniDrawer.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
// import { getIcon } from "../../utils/iconMap";

const drawerWidth = 180;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  })
);

export default function MiniDrawer({ menus = [], open }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [submenuOpen, setSubmenuOpen] = useState({});

  const handleClick = (id) => {
    setSubmenuOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigate = (e, link) => {
    if (e.ctrlKey) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  const renderMenu = (menu) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const active = location.pathname === menu.link;

    return (
      <React.Fragment key={menu.id}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            backgroundColor: active ? theme.palette.primary.light : "inherit",
            color: active ? theme.palette.primary.contrastText : "inherit",
          }}
          onClick={(e) => {
            if (hasChildren) handleClick(menu.id);
            else handleNavigate(e, menu.link);
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: active ? theme.palette.primary.contrastText : "inherit",
            }}
          >
            {/* {getIcon(menu.icon)} */}
          </ListItemIcon>
          {open && <ListItemText primary={menu.title} />}
          {open && hasChildren && (submenuOpen[menu.id] ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={submenuOpen[menu.id]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menu.children.map((sub) => {
                const subActive = location.pathname === sub.link;
                return (
                  <ListItemButton
                    key={sub.id}
                    sx={{
                      pl: open ? 4 : 2,
                      justifyContent: open ? "initial" : "center",
                      backgroundColor: subActive ? theme.palette.secondary.light : "inherit",
                      color: subActive ? theme.palette.secondary.contrastText : "inherit",
                    }}
                    onClick={(e) => handleNavigate(e, sub.link)}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: subActive ? theme.palette.secondary.contrastText : "inherit",
                      }}
                    >
                      {/* {getIcon(sub.icon)} */}
                    </ListItemIcon>
                    {open && <ListItemText primary={sub.title} />}
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer variant="permanent" open={open}>
      <Divider />
      <List>{menus.map(renderMenu)}</List>
    </Drawer>
  );
}
