// TableStylesUtil.js - Shared UI/UX improvements for all table components

export const tableStyles = {
  // Header styling
  headerStyle: {
    backgroundColor: '#2c3e50',
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 8px',
    fontSize: '0.9rem'
  },

  // Cell styling
  cellStyle: {
    padding: '10px 8px',
    fontSize: '0.85rem',
    color: '#2c3e50',
    borderColor: '#e0e0e0'
  },

  // Alternating row colors
  rowAlternateStyle: {
    backgroundColor: '#f8f9fa'
  },

  // Container styling
  containerStyle: {
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },

  // Title styling
  titleStyle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  // Button styling
  buttonStyle: {
    borderRadius: '4px',
    textTransform: 'none',
    fontSize: '0.85rem',
    padding: '6px 12px'
  },

  // Action button styling
  actionButtonStyle: {
    padding: '4px 8px',
    fontSize: '0.75rem',
    minWidth: '40px'
  }
};

// Reusable Table Header Component
export const StyledTableCell = (props) => {
  const { children, align = 'left', ...restProps } = props;
  return (
    <TableCell
      align={align}
      sx={{
        ...tableStyles.headerStyle,
        textAlign: align
      }}
      {...restProps}
    >
      {children}
    </TableCell>
  );
};

// Reusable Table Body Cell Component
export const StyledDataCell = (props) => {
  const { children, align = 'left', ...restProps } = props;
  return (
    <TableCell
      align={align}
      sx={{
        ...tableStyles.cellStyle,
        textAlign: align
      }}
      {...restProps}
    >
      {children}
    </TableCell>
  );
};

// No data message component
export const NoDataMessage = ({ message = 'कुनै डेटा उपलब्ध छैन' }) => (
  <Box sx={{ 
    py: 4, 
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: '0.95rem'
  }}>
    {message}
  </Box>
);

// Loading skeleton component
export const TableSkeleton = () => (
  <Box sx={{ py: 2 }}>
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} height={40} sx={{ mb: 1 }} />
    ))}
  </Box>
);
