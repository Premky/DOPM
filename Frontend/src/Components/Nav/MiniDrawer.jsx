// src/components/Nav/MiniDrawer.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { NavLink, useLocation } from "react-router-dom";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

const drawerWidth = 201;
const miniDrawerWidth = 0;

/* ----------------------------------------
  Styled Drawer
----------------------------------------- */
const StyledDrawer = styled( Drawer )( ( { theme } ) => ( {
  "& .MuiDrawer-paper": {
    top: "64px",
    height: "calc(100% - 64px)",
    background: "#fafafa",
    borderRight: "1px solid #e0e0e0",
    overflowX: "hidden",
    transition: "width 0.25s ease-in-out",
  },
} ) );

/* ----------------------------------------
  Styles used when active
----------------------------------------- */
const activeStyle = {
  background: "#e8f1ff",
  borderLeft: "4px solid #1976d2",
};

const iconActiveStyle = {
  background: "#1976d2",
  color: "#fff",
  borderRadius: 1,
  width: 36,
  height: 36,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* -------------------------------------------------------------------
  Filter menus recursively (search both parent & children)
-------------------------------------------------------------------- */
const filterMenus = ( menus, query ) => {
  if ( !query ) return menus;
  const q = query.toLowerCase();

  return menus
    .map( ( menu ) => {
      const matchesSelf = menu.title?.toLowerCase().includes( q );

      const children = Array.isArray( menu.children ) ? menu.children : [];

      // Recursively search children
      const filteredChildren = filterMenus( children, query );

      // CASE 1: parent matches → keep it with ALL filtered children
      if ( matchesSelf ) {
        return { ...menu, children: filteredChildren };
      }

      // CASE 2: parent does NOT match but children DO → keep parent + matching children
      if ( filteredChildren.length > 0 ) {
        return { ...menu, children: filteredChildren };
      }

      // CASE 3: no match in parent or children → remove
      return null;
    } )
    .filter( Boolean );
};


/* -------------------------------------------------------------------
  Check if any descendant link matches pathname
-------------------------------------------------------------------- */
const hasActiveChild = ( item, pathname ) => {
  if ( !item.children ) return false;

  return item.children.some( ( child ) => {
    const childLink = child.link
      ? child.link.startsWith( "/" ) ? child.link : "/" + child.link
      : "";

    const directMatch =
      childLink && ( pathname === childLink || pathname.startsWith( childLink ) );

    return (
      directMatch ||
      hasActiveChild( child, pathname ) // check deeper levels
    );
  } );
};


/* ----------------------------------------
  Recursive Menu Item
----------------------------------------- */
const MenuItemComponent = ( { item, open, level = 0 } ) => {
  const [subOpen, setSubOpen] = useState( false );
  const [userCollapsed, setUserCollapsed] = useState( false );

  const location = useLocation();
  const pathname = location.pathname;
  const menuLink = item.link ? ( item.link.startsWith( "/" ) ? item.link : "/" + item.link ) : "";

  // Determine active states:
  const isActive =
    !!menuLink &&
    ( pathname === menuLink || pathname.startsWith( menuLink ) ); // handles params like /bandi/123
  const childIsActive = hasActiveChild( item, pathname );
  // const shouldOpen = childIsActive || subOpen;
  const shouldOpen = userCollapsed ? subOpen : ( childIsActive || subOpen );

  // Auto-open when child is active
  useEffect( () => {
    if ( childIsActive && !userCollapsed ) {
      setSubOpen( true );
    }
  }, [childIsActive, userCollapsed] );

  // Auto-scroll active item into view
  const itemRef = useRef( null );
  useEffect( () => {
    if ( isActive && itemRef.current ) {
      setTimeout( () => {
        itemRef.current.scrollIntoView( { behavior: "smooth", block: "center" } );
      }, 200 );
    }
  }, [isActive] );

  const hasChildren = Array.isArray( item.children ) && item.children.length > 0;

  return (
    <>
      <Tooltip title={!open ? item.title : ""} placement="right" arrow>
        <ListItemButton
          ref={itemRef}
          component={item.link ? NavLink : "div"}
          to={item.link || ""}
          onClick={( e ) => {
            if ( hasChildren ) {
              e.preventDefault();

              const nextState = !subOpen;
              setSubOpen( nextState );

              //Track user manual collapse and expand
              if ( childIsActive ) {
                // setUserCollapsed(!nextState); //Mark collapsed if closing
                if ( !nextState ) setUserCollapsed( true );   // collapsed manually
                else setUserCollapsed( false );
              }
            }
          }}
          sx={{
            pl: 2 + level * 2,
            margin: "4px 8px",
            borderRadius: "8px",
            minHeight: 48,
            transition: "all 0.12s ease-in-out",
            "&:hover": { background: "#f1f5ff" },
            ...( isActive || childIsActive ? activeStyle : {} ),
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {/* Icon with active indicator even when collapsed */}
          {/* <ListItemIcon sx={{ minWidth: 40, mr: open ? 1 : 0 }}>
              {isActive ? (
                <Box sx={iconActiveStyle}>
                  <span className="material-icons" style={{ fontSize: 18 }}>
                    {item.icon || "menu"}
                  </span>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>
                    {item.icon || "menu"}
                  </span>
                </Box>
              )}
            </ListItemIcon> */}

          {/* Title */}
          {open ? (
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontWeight: isActive || childIsActive ? 700 : 500,
              }}
            />
          ) : null}

          {/* Expand icon */}
          {open && hasChildren && (
            <ExpandMore
              sx={{
                transform: subOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.18s",
                color: childIsActive ? "#1976d2" : "inherit",
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>

      {/* Children */}
      {hasChildren && (
        <Collapse in={shouldOpen} timeout={200} unmountOnExit>
          <List disablePadding>
            {item.children.map( ( child ) => (
              <MenuItemComponent key={child.id} item={child} open={open} level={level + 1} />
            ) )}
          </List>
        </Collapse>
      )}
    </>
  );
};

/* ----------------------------------------
  MAIN COMPONENT — WITH SEARCH & FILTER
----------------------------------------- */
export default function MiniDrawer( { menus = [], open = true } ) {
  const [search, setSearch] = useState( "" );
  const filteredMenus = filterMenus( menus, search );

  return (
    <StyledDrawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : miniDrawerWidth,
        "& .MuiDrawer-paper": { width: open ? drawerWidth : miniDrawerWidth },
      }}
    >
      {/* SEARCH BAR - only visible when open */}
      {open && (
        <Box sx={{ p: 1, position: "sticky", top: 0, zIndex: 10, bgcolor: "#fafafa" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search menus..."
            value={search}
            onChange={( e ) => setSearch( e.target.value )}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 1 },
            }}
          />
          {search && (
            <Typography variant="caption" sx={{ ml: 0.5, mt: 0.5, display: "block", color: "text.secondary" }}>
              Showing results for “{search}”
            </Typography>
          )}
        </Box>
      )}

      <List sx={{ pt: 1 }}>
        {filteredMenus.length > 0 ? (
          filteredMenus.map( ( menu ) => <MenuItemComponent key={menu.id} item={menu} open={open} /> )
        ) : (
          open && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No results found
              </Typography>
            </Box>
          )
        )}
      </List>
    </StyledDrawer>
  );
}
