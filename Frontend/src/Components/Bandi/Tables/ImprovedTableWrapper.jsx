// ImprovedTableWrapper.jsx - Enhanced UI/UX wrapper for all data tables
import React from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  CircularProgress
} from '@mui/material';

export const ImprovedTableWrapper = ({
  title,
  icon,
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  onAdd,
  children,
  noDataMessage = 'कुनै डेटा उपलब्ध छैन'
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      {children ? (
        // If children provided, render as is (for complex layouts)
        <Box sx={{ borderRadius: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {children}
        </Box>
      ) : (
        // Standard table layout
        <Box>
          {title && (
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: '#2c3e50',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {icon && <span>{icon}</span>}
                {title}
              </Typography>
              {onAdd && (
                <Box>
                  {/* Add button can be passed as callback */}
                </Box>
              )}
            </Box>
          )}

          {loading ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={40} />
            </Box>
          ) : !data || data.length === 0 ? (
            <Box sx={{ 
              py: 3, 
              textAlign: 'center', 
              color: '#95a5a6',
              backgroundColor: '#f8f9fa',
              borderRadius: 1
            }}>
              {noDataMessage}
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ 
              borderRadius: 1, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}>
              <Table size='small'>
                {columns && (
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      {columns.map((col, idx) => (
                        <TableCell
                          key={idx}
                          align={col.align || 'left'}
                          sx={{
                            fontWeight: 600,
                            color: '#2c3e50',
                            padding: '12px 8px',
                            fontSize: '0.9rem',
                            borderColor: '#e0e0e0'
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {data.map((row, idx) => (
                    <TableRow 
                      key={row.id || idx}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: '#f8f9fa',
                          transition: 'background-color 0.2s ease'
                        },
                        borderColor: '#e0e0e0'
                      }}
                    >
                      {columns.map((col, cidx) => (
                        <TableCell
                          key={cidx}
                          align={col.align || 'left'}
                          sx={{
                            padding: '10px 8px',
                            fontSize: '0.85rem',
                            color: '#2c3e50',
                            borderColor: '#e0e0e0'
                          }}
                        >
                          {col.render ? col.render(row) : row[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ImprovedTableWrapper;
