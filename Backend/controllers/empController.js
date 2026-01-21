import { promisify } from 'util';
import pool from '../utils/db3.js';
import { insertEmpRoute, insertJd, updateEmpRoute } from '../services/empService.js';
import { updateJd, deleteJd } from '../services/empService.js';
import { bs2ad } from '../utils/bs2ad.js';

// mysql2/promise already returns promises, no need to promisify
const query = ( sql, params ) => pool.query( sql, params );

/**
 * Create a new employee
 */
export const createNewEmployee = async ( req, res ) => {
  const conn = await pool.getConnection();
  const current_user = req.user.username;
  const active_office = req.user.office_id;

  // console.log("User:", current_user)
  try {
    await conn.beginTransaction();

    const {
      name_in_nepali,
      name_in_english,
      sanket_no,
      mobile_no,
      email,
      gender,
      dob,
      married_status,
      emp_group,
      emp_level,
      emp_post,
      province_id,
      district_id,
      municipality_id,
      ward_no,
      emp_type,
      jd,
      appointment_date_bs,
      hajir_miti_bs,
      current_office_id,
      is_current,
      is_chief
    } = req.body;

    // 1️⃣ Insert into employees
    const [empResult] = await conn.query(
      `INSERT INTO employees 
      (emp_type, name_in_nepali, name_in_english, sanket_no, mobile_no, email, gender, dob, dob_ad,  married_status, 
      join_date, join_date_ad, designation_id,
      province_id, district_id, municipality_id,ward_no, is_office_chief, photo_path,
      created_by, created_at, updated_by, updated_at, current_office_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 
              ?, ?, ?, 
              ?,?,?,?,?,?,
              ?, ?, ?, ?,?)`,
      [
        emp_type, name_in_nepali, name_in_english,
        sanket_no,
        mobile_no,
        email,
        gender,
        dob, await bs2ad( dob ),
        married_status,
        appointment_date_bs,
        await bs2ad( appointment_date_bs ),
        emp_post,
        province_id,
        district_id,
        municipality_id,
        ward_no, is_chief === 'हो' || is_chief === 'निमित्त' ? 1 : 0,
        req.file ? req.file.path : null,
        current_user, new Date(), current_user, new Date(), active_office
      ]
    );

    const employeeId = empResult.insertId;

    // 2️⃣ Insert into employee_post_history
    await conn.query(
      `INSERT INTO employee_post_history
      (employee_id, sanket_no,
      appointment_date_bs, appointment_date_ad, hajir_miti_bs, hajir_miti_ad,  
       jd, appointment_type, level_id, service_group_id, post_id, office_id, current_office_id, is_office_chief,
       updated_by, updated_at)
      VALUES (?, ?, 
              ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?, ?,?,
              ?, ?)`,
      [
        employeeId, sanket_no,
        appointment_date_bs, await bs2ad( appointment_date_bs ), hajir_miti_bs, await bs2ad( hajir_miti_bs ),
        jd, emp_type, emp_level, emp_group, emp_post, current_office_id, active_office, is_chief,
        current_user, new Date()
      ]
    );

    // 3️⃣ Insert into employee_transfer_history
    await conn.query(
      `INSERT INTO employee_transfer_history
      (employee_id, sanket_no, to_office_id, 
      transfer_date_bs, transfer_date_ad, hajir_date_bs, hajir_date_ad, 
      is_current, updated_by, updated_at
        )
      VALUES (?, ?, ?,
              ?, ?, ?, ?,
              ?, ?, ?)`,
      [employeeId, sanket_no, current_office_id,
        appointment_date_bs, await bs2ad( appointment_date_bs ), hajir_miti_bs, await bs2ad( hajir_miti_bs ),
        is_current, current_user, new Date()
      ]
    );

    await conn.commit();
    res.json( { Status: true, Result: employeeId } );
  } catch ( err ) {
    await conn.rollback();
    console.error( err );
    res.status( 500 ).json( { Status: false, Error: "Failed to create employee" } );
  } finally {
    conn.release();
  }


};
export const createEmployee = async ( req, res ) => {
  const connection = await pool.getConnection();

  try {
    const {
      emp_type,
      sanket_no,
      name_in_nepali,
      name_in_english,
      gender,
      dob,
      married_status,
      mobile_no,
      email,
      citizenship_no,
      issue_date,
      issue_district,
      province_id,
      district_id,
      city_id,
      ward_no,
      remarks,
      jd_details,
      active_office
    } = req.body;

    const user_id = req.user?.id;
    const photo_path = req.file ? `/uploads/emp_photo/${ req.file.filename }` : null;

    // Validate required fields
    if ( !sanket_no || !name_in_english || !name_in_nepali ) {
      return res.status( 400 ).json( {
        success: false,
        message: 'Required fields missing: sanket_no, name_in_english, name_in_nepali'
      } );
    }

    // Check if employee with same sanket_no exists
    const [existing] = await connection.query(
      'SELECT id FROM employees WHERE sanket_no = ?',
      [sanket_no]
    );

    if ( existing.length > 0 ) {
      return res.status( 409 ).json( {
        success: false,
        message: 'Employee with this sanket_no already exists'
      } );
    }

    // Prepare data
    const employeeData = {
      emp_type,
      sanket_no,
      name_in_nepali,
      name_in_english,
      gender,
      dob,
      married_status,
      mobile_no,
      email,
      citizenship_no,
      issue_date,
      issue_district,
      province_id,
      district_id,
      city_id,
      ward_no,
      remarks,
      photo_path,
      user_id,
      active_office
    };

    // Insert employee
    const empId = await insertEmpRoute( employeeData, connection );

    if ( !empId ) {
      return res.status( 500 ).json( {
        success: false,
        message: 'Failed to create employee'
      } );
    }

    // Insert job details if provided
    if ( jd_details && Array.isArray( jd_details ) && jd_details.length > 0 ) {
      for ( const jd of jd_details ) {
        await insertJd( empId, jd, user_id, active_office, connection );
      }
    }

    res.status( 201 ).json( {
      success: true,
      message: 'Employee created successfully',
      data: {
        id: empId,
        sanket_no
      }
    } );
  } catch ( error ) {
    console.error( 'Error creating employee:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error creating employee',
      error: error.message
    } );
  } finally {
    if ( connection ) await connection.release();
  }
};

/**
 * Get all employees with pagination
 */
export const getEmployees = async ( req, res ) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      emp_type = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = ( page - 1 ) * limit;
    const validSortOrder = ['ASC', 'DESC'].includes( sortOrder.toUpperCase() ) ? sortOrder.toUpperCase() : 'DESC';

    let whereClause = 'WHERE 1 = 1';
    let params = [];

    // Search filter
    if ( search ) {
      whereClause += ' AND (name_in_english LIKE ? OR name_in_nepali LIKE ? OR sanket_no LIKE ? OR email LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%`, `%${ search }%`, `%${ search }%` );
    }

    // Employee type filter
    if ( emp_type ) {
      whereClause += ' AND emp_type = ?';
      params.push( emp_type );
    }

    whereClause += ' AND is_current_post = 1 ';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM view_full_employe ${ whereClause }`;
    const [countResult] = await query( countSql, params );
    const total = countResult[0].total;

    const sql = `
      SELECT * FROM view_full_employe
      ${ whereClause }
      ORDER BY ${ sortBy } ${ validSortOrder }
      LIMIT ? OFFSET ?
    `;

    params.push( parseInt( limit ), parseInt( offset ) );
    const [employees] = await query( sql, params );

    res.json( {
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt( page ),
        limit: parseInt( limit ),
        totalPages: Math.ceil( total / limit )
      }
    } );
  } catch ( error ) {
    console.error( 'Error fetching employees:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error fetching employees',
      error: error.message
    } );
  }
};
export const getEmployees2 = async ( req, res ) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      emp_type = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = ( page - 1 ) * limit;
    const validSortOrder = ['ASC', 'DESC'].includes( sortOrder.toUpperCase() ) ? sortOrder.toUpperCase() : 'DESC';

    let whereClause = 'WHERE is_active = 1';
    let params = [];

    // Search filter
    if ( search ) {
      whereClause += ' AND (name_in_english LIKE ? OR name_in_nepali LIKE ? OR sanket_no LIKE ? OR email LIKE ?)';
      params.push( `%${ search }%`, `%${ search }%`, `%${ search }%`, `%${ search }%` );
    }

    // Employee type filter
    if ( emp_type ) {
      whereClause += ' AND emp_type = ?';
      params.push( emp_type );
    }

    // whereClause += ' AND is_current_post = 1 ';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM view_full_employe ${ whereClause }`;
    const [countResult] = await query( countSql, params );
    const total = countResult[0].total;

    const sql = `
      SELECT * FROM view_full_employe
      ${ whereClause }
      ORDER BY ${ sortBy } ${ validSortOrder }
      LIMIT ? OFFSET ?
    `;

    params.push( parseInt( limit ), parseInt( offset ) );
    const [employees] = await query( sql, params );

    res.json( {
      success: true,
      data: employees,
      pagination: {
        total,
        page: parseInt( page ),
        limit: parseInt( limit ),
        totalPages: Math.ceil( total / limit )
      }
    } );
  } catch ( error ) {
    console.error( 'Error fetching employees:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error fetching employees',
      error: error.message
    } );
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async ( req, res ) => {
  try {
    const { id } = req.params;
    // Get main employee data
    const [employees] = await query(
      `SELECT * FROM employees WHERE id = ? AND is_active = 1`,
      [id]
    );

    if ( employees.length === 0 ) {
      return res.status( 404 ).json( {
        success: false,
        message: 'Employee not found'
      } );
    }

    const employee = employees[0];

    // Get job details from employee_post_history
    const [jobDetails] = await query(
      `SELECT * FROM employee_post_history WHERE employee_id = ? ORDER BY appointment_date_ad DESC`,
      [id]
    );

    res.json( {
      success: true,
      data: {
        ...employee,
        jobDetails
      }
    } );
  } catch ( error ) {
    console.error( 'Error fetching employee:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error fetching employee',
      error: error.message
    } );
  }
};

/**
 * Update employee
 */
export const updateEmployee = async ( req, res ) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const {
      emp_type,
      sanket_no,
      name_in_nepali,
      name_in_english,
      gender,
      dob,
      married_status,
      mobile_no,
      email,
      citizenship_no,
      issue_date,
      issue_district,
      province_id,
      district_id,
      city_id,
      ward_no,
      remarks,
      jd_details,
      // job-related single-entry fields (for append)
      jd,
      appointment_date_bs,
      appointment_date_ad,
      hajir_miti_bs,
      hajir_miti_ad,
      appointment_type,
      post_id,
      current_office_id,
      emp_group,
      emp_level,
      is_chief,
      active_office,
      is_active
    } = req.body;

    const user_id = req.user?.id;

    // Check if employee exists
    const [existing] = await connection.query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if ( existing.length === 0 ) {
      return res.status( 404 ).json( {
        success: false,
        message: 'Employee not found'
      } );
    }

    

    // Check for duplicate sanket_no
    if ( sanket_no ) {
      const [duplicate] = await connection.query(
        'SELECT id FROM employees WHERE sanket_no = ? AND id != ?',
        [sanket_no, id]
      );

      if ( duplicate.length > 0 ) {
        return res.status( 409 ).json( {
          success: false,
          message: 'Employee with this sanket_no already exists'
        } );
      }
    }

    // Prepare update data
    const updateData = {
      emp_type,
      sanket_no,
      name_in_nepali,
      name_in_english,
      gender,
      dob,
      married_status,
      mobile_no,
      email,
      citizenship_no,
      issue_date,
      issue_district,
      province_id,
      district_id,
      city_id,
      ward_no,
      remarks,
      // photo
      photo_path: req.file ? `/uploads/emp_photo/${ req.file.filename }` : undefined,
      // job-related fields to append a job history row
      jd,
      appointment_date_bs,
      appointment_date_ad,
      hajir_miti_bs,
      hajir_miti_ad,
      appointment_type,
      post_id,
      current_office_id,
      emp_group,
      emp_level,
      is_chief,
      // offices/flags
      active_office: active_office || req.user?.office_id,
      is_active: is_active !== undefined ? is_active : 1,
      user_id
    };

    // Remove undefined values
    Object.keys( updateData ).forEach( key =>
      updateData[key] === undefined && delete updateData[key]
    );

    // Update employee
    const result = await updateEmpRoute( id, updateData, connection );

    if ( !result ) {
      return res.status( 500 ).json( {
        success: false,
        message: 'Failed to update employee'
      } );
    }

    // Update job details if provided
    if ( jd_details && Array.isArray( jd_details ) ) {
      // Delete old job details
      await connection.query( 'DELETE FROM employee_post_history WHERE employee_id = ?', [id] );

      // Insert new job details
      for ( const jd of jd_details ) {
        await insertJd( id, jd, user_id, active_office, connection );
      }
    }

    res.json( {
      success: true,
      message: 'Employee updated successfully',
      data: { id }
    } );
  } catch ( error ) {
    console.error( 'Error updating employee:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error updating employee',
      error: error.message
    } );
  } finally {
    if ( connection ) await connection.release();
  }
};

/**
 * Create a job detail for an employee (append)
 */
export const createJobDetail = async ( req, res ) => {
  const connection = await pool.getConnection();
  try {
    const { id: employeeId } = req.params;
    const user_id = req.user?.id;
    const active_office = req.user?.office_id;
    const data = req.body;

    await insertJd(employeeId, data, user_id, active_office, connection);
    res.json({ success: true, message: 'Job detail added' });
  } catch (err) {
    console.error('Error creating job detail:', err);
    res.status(500).json({ success: false, message: 'Failed to create job detail' });
  } finally {
    if (connection) await connection.release();
  }
};

/**
 * Update a job detail row
 */
export const updateJobDetail = async ( req, res ) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params; // job id
    const user_id = req.user?.id;
    const active_office = req.user?.office_id;
    const data = req.body;

    const result = await updateJd(id, data, user_id, active_office, connection);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error updating job detail:', err);
    res.status(500).json({ success: false, message: 'Failed to update job detail' });
  } finally {
    if (connection) await connection.release();
  }
};

/**
 * Delete a job detail row
 */
export const deleteJobDetail = async ( req, res ) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params; // job id
    const result = await deleteJd(id, connection);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error deleting job detail:', err);
    res.status(500).json({ success: false, message: 'Failed to delete job detail' });
  } finally {
    if (connection) await connection.release();
  }
};

/**
 * Delete employee (soft delete)
 */
export const deleteEmployee = async ( req, res ) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const [existing] = await query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if ( existing.length === 0 ) {
      return res.status( 404 ).json( {
        success: false,
        message: 'Employee not found'
      } );
    }

    // Soft delete
    await query(
      'UPDATE employees SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json( {
      success: true,
      message: 'Employee deleted successfully'
    } );
  } catch ( error ) {
    console.error( 'Error deleting employee:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error deleting employee',
      error: error.message
    } );
  }
};

/**
 * Restore deleted employee
 */
export const restoreEmployee = async ( req, res ) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const [existing] = await query(
      'SELECT id FROM employees WHERE id = ?',
      [id]
    );

    if ( existing.length === 0 ) {
      return res.status( 404 ).json( {
        success: false,
        message: 'Employee not found'
      } );
    }

    // Restore employee
    await query(
      'UPDATE employees SET is_active = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json( {
      success: true,
      message: 'Employee restored successfully'
    } );
  } catch ( error ) {
    console.error( 'Error restoring employee:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error restoring employee',
      error: error.message
    } );
  }
};

/**
 * Get employee statistics
 */
export const getEmployeeStats = async ( req, res ) => {
  try {
    const [stats] = await query( `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN emp_type = 1 THEN 1 ELSE 0 END) as permanent_count,
        SUM(CASE WHEN emp_type = 2 THEN 1 ELSE 0 END) as contract_count,
        SUM(CASE WHEN emp_type = 3 THEN 1 ELSE 0 END) as daily_count,
        SUM(CASE WHEN gender = 'M' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) as female_count
      FROM employees
      WHERE is_active = 1
    `);

    res.json( {
      success: true,
      data: stats[0]
    } );
  } catch ( error ) {
    console.error( 'Error fetching stats:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    } );
  }
};

/**
 * Bulk import employees
 */
export const bulkImportEmployees = async ( req, res ) => {
  const connection = await pool.getConnection();

  try {
    const { employees } = req.body;

    if ( !Array.isArray( employees ) || employees.length === 0 ) {
      return res.status( 400 ).json( {
        success: false,
        message: 'Invalid employee data'
      } );
    }

    const user_id = req.user?.id;
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for ( const emp of employees ) {
      try {
        // Check for duplicate
        const [existing] = await connection.query(
          'SELECT id FROM employees WHERE sanket_no = ?',
          [emp.sanket_no]
        );

        if ( existing.length > 0 ) {
          failureCount++;
          results.push( {
            sanket_no: emp.sanket_no,
            success: false,
            message: 'Employee with this sanket_no already exists'
          } );
          continue;
        }

        const empData = {
          ...emp,
          user_id,
          active_office: emp.active_office || req.body.default_office
        };

        const empId = await insertEmpRoute( empData, connection );

        if ( empId ) {
          successCount++;
          results.push( {
            sanket_no: emp.sanket_no,
            success: true,
            id: empId
          } );
        } else {
          failureCount++;
          results.push( {
            sanket_no: emp.sanket_no,
            success: false,
            message: 'Failed to insert employee'
          } );
        }
      } catch ( error ) {
        failureCount++;
        results.push( {
          sanket_no: emp.sanket_no,
          success: false,
          message: error.message
        } );
      }
    }

    res.json( {
      success: true,
      message: `Import completed: ${ successCount } successful, ${ failureCount } failed`,
      successCount,
      failureCount,
      results
    } );
  } catch ( error ) {
    console.error( 'Error bulk importing employees:', error );
    res.status( 500 ).json( {
      success: false,
      message: 'Error importing employees',
      error: error.message
    } );
  } finally {
    if ( connection ) await connection.release();
  }
};
