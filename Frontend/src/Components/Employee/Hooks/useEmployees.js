import { useState, useCallback } from 'react';
import employeeService from '../services/employeeService';

/**
 * Custom React Hook for Employee Management
 * Handles all employee-related state and API operations
 */
export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [stats, setStats] = useState(null);
  const [searchParams, setSearchParams] = useState({
    search: '',
    emp_type: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  // Fetch employees list
  const fetchEmployees = useCallback(async (page = 1, limit = 10, params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.getEmployees({
        page,
        limit,
        ...searchParams,
        ...params
      });

      if (response.success) {
        setEmployees(response.data || []);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch employees');
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred while fetching employees';
      setError(errorMsg);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch single employee
  const fetchEmployeeById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.getEmployeeById(id);

      if (response.success) {
        setCurrentEmployee(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch employee');
        return null;
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred';
      setError(errorMsg);
      console.error('Error fetching employee:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create employee
  const createEmployee = useCallback(async (employeeData, photoFile = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.createEmployee(employeeData, photoFile);

      if (response.success) {
        // Refresh list
        await fetchEmployees(1, pagination.limit);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create employee');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred';
      setError(errorMsg);
      console.error('Error creating employee:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [pagination, fetchEmployees]);

  // Update employee
  const updateEmployee = useCallback(async (id, employeeData, photoFile = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.updateEmployee(id, employeeData, photoFile);

      if (response.success) {
        // Update current employee and list
        await fetchEmployeeById(id);
        await fetchEmployees(pagination.page, pagination.limit);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update employee');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred';
      setError(errorMsg);
      console.error('Error updating employee:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [pagination, fetchEmployees, fetchEmployeeById]);

  // Delete employee
  const deleteEmployee = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.deleteEmployee(id);

      if (response.success) {
        // Refresh list
        await fetchEmployees(pagination.page, pagination.limit);
        setCurrentEmployee(null);
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete employee');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred';
      setError(errorMsg);
      console.error('Error deleting employee:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [pagination, fetchEmployees]);

  // Restore employee
  const restoreEmployee = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.restoreEmployee(id);

      if (response.success) {
        // Refresh list
        await fetchEmployees(pagination.page, pagination.limit);
        return { success: true };
      } else {
        setError(response.message || 'Failed to restore employee');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred';
      setError(errorMsg);
      console.error('Error restoring employee:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [pagination, fetchEmployees]);

  // Get statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await employeeService.getEmployeeStats();

      if (response.success) {
        setStats(response.data);
        return response.data;
      } else {
        console.error('Failed to fetch stats:', response.message);
        return null;
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, []);

  // Bulk import
  const bulkImport = useCallback(async (employeesList, defaultOffice) => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeeService.bulkImportEmployees(employeesList, defaultOffice);

      if (response.success) {
        await fetchEmployees(1, pagination.limit);
        return {
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount,
          results: response.results
        };
      } else {
        setError(response.message || 'Failed to import employees');
        return {
          success: false,
          error: response.message,
          results: response.results
        };
      }
    } catch (err) {
      const errorMsg = err?.message || 'An error occurred';
      setError(errorMsg);
      console.error('Error bulk importing:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [pagination, fetchEmployees]);

  // Update search parameters
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setEmployees([]);
    setCurrentEmployee(null);
    setError(null);
    setStats(null);
    setPagination({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    });
    setSearchParams({
      search: '',
      emp_type: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
  }, []);

  return {
    // State
    employees,
    currentEmployee,
    loading,
    error,
    pagination,
    stats,
    searchParams,

    // Methods
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
    fetchStats,
    bulkImport,
    updateSearchParams,
    clearAll,

    // Utilities
    hasEmployees: employees.length > 0,
    totalEmployees: pagination.total,
    isLoading: loading,
    hasError: !!error
  };
};

/**
 * Alternative simpler hook for basic operations
 */
export const useEmployeeForm = (initialData = null) => {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  const updateFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setError(null);
    setSuccess(false);
  }, [initialData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setLoaderState = useCallback((state) => {
    setLoading(state);
  }, []);

  const setSuccessMessage = useCallback((show) => {
    setSuccess(show);
  }, []);

  return {
    formData,
    loading,
    error,
    success,
    updateField,
    updateFields,
    resetForm,
    clearError,
    setLoaderState,
    setSuccessMessage
  };
};

export default useEmployees;
