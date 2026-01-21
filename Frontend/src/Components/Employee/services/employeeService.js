import axios from 'axios';

/**
 * Employee API Service
 * Handles all employee-related API calls to the backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';
const EMPLOYEE_ENDPOINT = `${ API_BASE }/emp`;

/**
 * Create a new employee
 */
export const createEmployee = async ( employeeData, photoFile ) => {
    try {
        const formData = new FormData();

        // Add employee data
        Object.keys( employeeData ).forEach( key => {
            if ( employeeData[key] !== null && employeeData[key] !== undefined ) {
                formData.append( key, employeeData[key] );
            }
        } );

        // Add photo if provided
        if ( photoFile ) {
            formData.append( 'photo', photoFile );
        }

        const response = await axios.post( `${ EMPLOYEE_ENDPOINT }/create_employee`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        } );

        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get all employees with pagination and search
 */
export const getEmployees = async ( params = {} ) => {
    console.log( 'Fetching emp record' );
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            emp_type = '',
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = params;

        const response = await axios.get( `${ EMPLOYEE_ENDPOINT }/list`, {
            params: {
                page,
                limit,
                search,
                emp_type,
                sortBy,
                sortOrder
            },
            withCredentials: true
        } );

        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async ( id ) => {
    try {
        const response = await axios.get( `${ EMPLOYEE_ENDPOINT }/${ id }`, {
            withCredentials: true
        } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Update employee
 */
export const updateEmployee = async ( id, employeeData, photoFile ) => {
    try {
        const formData = new FormData();

        // Add employee data
        Object.keys( employeeData ).forEach( key => {
            if ( employeeData[key] !== null && employeeData[key] !== undefined ) {
                if ( Array.isArray( employeeData[key] ) ) {
                    formData.append( key, JSON.stringify( employeeData[key] ) );
                } else {
                    formData.append( key, employeeData[key] );
                }
            }
        } );

        // Add photo if provided
        if ( photoFile ) {
            formData.append( 'photo', photoFile );
        }

        const response = await axios.put( `${ EMPLOYEE_ENDPOINT }/${ id }`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
        } );

        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Delete employee (soft delete)
 */
export const deleteEmployee = async ( id ) => {
    try {
        const response = await axios.delete( `${ EMPLOYEE_ENDPOINT }/${ id }`, {
            withCredentials: true
        } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Restore deleted employee
 */
export const restoreEmployee = async ( id ) => {
    try {
        const response = await axios.patch( `${ EMPLOYEE_ENDPOINT }/${ id }/restore`, {}, {
            withCredentials: true
        } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Transfer employee to another office/post
 */
export const transferEmployee = async ( id, payload ) => {
    try {
        const response = await axios.post( `${ EMPLOYEE_ENDPOINT }/${ id }/transfer`, payload, {
            withCredentials: true
        } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Create a job detail for an employee (append)
 */
export const createJobDetail = async ( employeeId, payload ) => {
    try {
        const response = await axios.post(`${EMPLOYEE_ENDPOINT}/${employeeId}/job`, payload, { withCredentials: true });
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

export const updateJobDetail = async ( jobId, payload ) => {
    try {
        const response = await axios.put(`${EMPLOYEE_ENDPOINT}/job/${jobId}`, payload, { withCredentials: true });
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

export const deleteJobDetail = async ( jobId ) => {
    try {
        const response = await axios.delete(`${EMPLOYEE_ENDPOINT}/job/${jobId}`, { withCredentials: true });
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get employee statistics
 */
export const getEmployeeStats = async () => {
    try {
        const response = await axios.get( `${ EMPLOYEE_ENDPOINT }/api/stats`, { withCredentials: true } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Bulk import employees
 */
export const bulkImportEmployees = async ( employees, defaultOffice ) => {
    try {
        const response = await axios.post(
            `${ EMPLOYEE_ENDPOINT }/bulk-import`,
            {
                employees,
                default_office: defaultOffice
            },
            { withCredentials: true }
        );

        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get all employees (old endpoint - for backward compatibility)
 */
export const getAllEmployees = async () => {
    try {
        const response = await axios.get( `${ EMPLOYEE_ENDPOINT }/get_employees`, {
            withCredentials: true
        } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

/**
 * Get employee by sanket_no
 */
export const getEmployeeBySanketNo = async ( sanketNo ) => {
    try {
        const response = await axios.get( `${ EMPLOYEE_ENDPOINT }/get_emp_sanket_no`, {
            params: { sanket_no: sanketNo },
            withCredentials: true
        } );
        return response.data;
    } catch ( error ) {
        throw error.response?.data || error.message;
    }
};

export default {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
    getEmployeeStats,
    bulkImportEmployees,
    getAllEmployees,
    getEmployeeBySanketNo
};
