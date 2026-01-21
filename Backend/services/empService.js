import { bs2ad } from '../utils/bs2ad.js';
import pool from '../utils/db3.js';

async function insertEmpRoute( data, connection ) {
  console.log( data );
  const dob_ad = await bs2ad( data.dob );
  // let connection = data.connection;    
  try {
    if ( !data ) {
      console.warn( "⚠️ No emp data provided to insert." );
      return 0;
    }
    const filteredData = ( typeof data.sanket_no === 'string' && data.sanket_no.trim() !== '' ) ||
      ( typeof data.emp_type === 'number' && !isNaN( data.emp_type ) );

    if ( !filteredData ) {
      console.warn( "⚠️ All contacts filtered out. Possibly missing 'sanket_no'." );
      // console.log( "🔍 Received contacts:", data );
      return 0;
    }

    const sql = `INSERT INTO employees (
                emp_type, sanket_no, name_in_nepali, name_in_english,
                gender, dob, dob_ad, married_status, mobile_no, email, 
                citizenship_no, issue_date, issue_district_id, 
                province_id, district_id, municipality_id, ward_no,
                is_active, photo_path, remarks,
                created_by, updated_by, created_at, updated_at, current_office_id
                ) VALUES (?)`;
    const values = [
      data.emp_type, data.sanket_no, data.name_in_nepali, data.name_in_english,
      data.gender, data.dob, dob_ad, data.married_status, data.mobile_no, data.email,
      data.citizenship_no, data.issue_date, data.issue_district,
      data.province_id, data.district_id, data.city_id, data.ward_no,
      1, data.photo_path, data.remarks,
      data.user_id, data.user_id, new Date(), new Date(),
      data.active_office
    ];
    // const result = await queryAsync( sql, [values] );
    const [result] = await connection.query( sql, [values] );
    console.log( "✅ Insert result:", result );
    return result.insertId || 0;
  } catch ( err ) {
    console.error( "❌ SQL/Insert error:", err ); // <-- logs real SQL or DB issues
    throw err;
  }
}

async function insertJd( emp_id, data, user_id, active_office, connection ) {

  const baseValues = [
    emp_id,
    data.appointment_date_bs,
    data.appointment_date_ad,
    data.hajir_miti_bs,
    data.hajir_miti_ad,
    data.jd,
    data.appointment_type,
    data.emp_level, data.emp_group, data.emp_post,     
    data.karagar_office,
    data.is_chief,
    data.remarks_post
  ];

  const auditFields = [user_id, new Date(), active_office];

  let values, sql;
  try {
    values = [...baseValues, ...auditFields];
    sql = `INSERT INTO employee_post_history(
      employee_id, appointment_date_bs, appointment_date_ad, hajir_miti_bs,hajir_miti_ad, jd, appointment_type,
      level_id, service_group_id, post_id, 
      office_id, is_office_chief, remarks, updated_by, updated_at,current_office_id ) VALUES (?)`;
    const [result] = await connection.query( sql, [values] );
  } catch ( err ) {
    console.error( "❌ Error preparing SQL for insertJd:", err );
    throw err;
  } 
  // await queryAsync( sql, [values] );
}

async function updateJd( jd_id, data, user_id, active_office, connection ) {
  try {
    const updateFields = [];
    const updateValues = [];

    if ( data.appointment_date_bs !== undefined ) {
      updateFields.push('appointment_date_bs = ?');
      updateValues.push(data.appointment_date_bs);
    }
    if ( data.appointment_date_ad !== undefined ) {
      updateFields.push('appointment_date_ad = ?');
      updateValues.push(data.appointment_date_ad);
    }
    if ( data.hajir_miti_bs !== undefined ) {
      updateFields.push('hajir_miti_bs = ?');
      updateValues.push(data.hajir_miti_bs);
    }
    if ( data.hajir_miti_ad !== undefined ) {
      updateFields.push('hajir_miti_ad = ?');
      updateValues.push(data.hajir_miti_ad);
    }
    if ( data.jd !== undefined ) {
      updateFields.push('jd = ?');
      updateValues.push(data.jd);
    }
    if ( data.appointment_type !== undefined ) {
      updateFields.push('appointment_type = ?');
      updateValues.push(data.appointment_type);
    }
    if ( data.level_id !== undefined ) {
      updateFields.push('level_id = ?');
      updateValues.push(data.level_id);
    }
    if ( data.service_group_id !== undefined ) {
      updateFields.push('service_group_id = ?');
      updateValues.push(data.service_group_id);
    }
    if ( data.post_id !== undefined ) {
      updateFields.push('post_id = ?');
      updateValues.push(data.post_id);
    }
    if ( data.office_id !== undefined ) {
      updateFields.push('office_id = ?');
      updateValues.push(data.office_id);
    }
    if ( data.current_office_id !== undefined ) {
      updateFields.push('current_office_id = ?');
      updateValues.push(data.current_office_id);
    }
    if ( data.is_office_chief !== undefined ) {
      updateFields.push('is_office_chief = ?');
      updateValues.push(data.is_office_chief);
    }
    if ( data.remarks !== undefined ) {
      updateFields.push('remarks = ?');
      updateValues.push(data.remarks);
    }

    if ( updateFields.length === 0 ) return { affectedRows: 0 };

    updateFields.push('updated_by = ?');
    updateValues.push(user_id);
    updateFields.push('updated_at = ?');
    updateValues.push(new Date());

    const sql = `UPDATE employee_post_history SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(jd_id);
    const [result] = await connection.query(sql, updateValues);
    return result;
  } catch (err) {
    console.error('❌ updateJd error:', err);
    throw err;
  }
}

async function deleteJd( jd_id, connection ) {
  try {
    const sql = `DELETE FROM employee_post_history WHERE id = ?`;
    const [result] = await connection.query(sql, [jd_id]);
    return result;
  } catch (err) {
    console.error('❌ deleteJd error:', err);
    throw err;
  }
}

async function updateEmpRoute( emp_id, data, connection ) {
  try {
    const user_id = data.user_id;
    const active_office = data.active_office;
    const dob_ad = data.dob_ad || (data.dob ? await bs2ad( data.dob ) : null);

    const updateFields = [];
    const updateValues = [];

    if ( data.emp_type !== undefined ) {
      updateFields.push( 'emp_type = ?' );
      updateValues.push( data.emp_type );
    }
    if ( data.sanket_no ) {
      updateFields.push( 'sanket_no = ?' );
      updateValues.push( data.sanket_no );
    }
    if ( data.name_in_nepali ) {
      updateFields.push( 'name_in_nepali = ?' );
      updateValues.push( data.name_in_nepali );
    }
    if ( data.name_in_english ) {
      updateFields.push( 'name_in_english = ?' );
      updateValues.push( data.name_in_english );
    }
    if ( data.gender ) {
      updateFields.push( 'gender = ?' );
      updateValues.push( data.gender );
    }
    if ( data.dob ) {
      updateFields.push( 'dob = ?' );
      updateValues.push( data.dob );
      if ( dob_ad ) {
        updateFields.push( 'dob_ad = ?' );
        updateValues.push( dob_ad );
      }
    }
    if ( data.married_status ) {
      updateFields.push( 'married_status = ?' );
      updateValues.push( data.married_status );
    }
    if ( data.mobile_no ) {
      updateFields.push( 'mobile_no = ?' );
      updateValues.push( data.mobile_no );
    }
    if ( data.email ) {
      updateFields.push( 'email = ?' );
      updateValues.push( data.email );
    }
    if ( data.citizenship_no ) {
      updateFields.push( 'citizenship_no = ?' );
      updateValues.push( data.citizenship_no );
    }
    if ( data.issue_date ) {
      updateFields.push( 'issue_date = ?' );
      updateValues.push( data.issue_date );
    }
    if ( data.issue_district ) {
      updateFields.push( 'issue_district_id = ?' );
      updateValues.push( data.issue_district );
    }
    if ( data.province_id ) {
      updateFields.push( 'province_id = ?' );
      updateValues.push( data.province_id );
    }
    if ( data.district_id ) {
      updateFields.push( 'district_id = ?' );
      updateValues.push( data.district_id );
    }
    if ( data.city_id ) {
      updateFields.push( 'municipality_id = ?' );
      updateValues.push( data.city_id );
    }
    if ( data.ward_no ) {
      updateFields.push( 'ward_no = ?' );
      updateValues.push( data.ward_no );
    }
    if ( data.current_office_id ) {
      updateFields.push( 'current_office_id = ?' );
      updateValues.push( data.current_office_id );
    }
    if ( data.post_id ) {
      updateFields.push( 'designation_id = ?' );
      updateValues.push( data.post_id );
    }
    if ( data.photo_path ) {
      updateFields.push( 'photo_path = ?' );
      updateValues.push( data.photo_path );
    }
    if ( data.remarks ) {
      updateFields.push( 'remarks = ?' );
      updateValues.push( data.remarks );
    }

    updateFields.push( 'updated_by = ?' );
    updateValues.push( user_id );
    updateFields.push( 'updated_at = ?' );
    updateValues.push( new Date() );

    if ( updateFields.length === 0 ) {
      return { affectedRows: 0 };
    }

    const sql = `UPDATE employees SET ${updateFields.join( ', ' )} WHERE id = ?`;
    updateValues.push( emp_id );

    const [result] = await connection.query( sql, updateValues );

    // If appointment/job related fields are present, insert a new job detail row
    const hasJdFields = data.jd || data.appointment_date_bs || data.hajir_miti_bs || data.post_id || data.current_office_id || data.emp_group || data.emp_level;
    if ( hasJdFields ) {
      try {
        const jdPayload = {
          appointment_date_bs: data.appointment_date_bs,
          appointment_date_ad: data.appointment_date_ad,
          hajir_miti_bs: data.hajir_miti_bs,
          hajir_miti_ad: data.hajir_miti_ad,
          jd: data.jd,
          appointment_type: data.appointment_type,
          emp_level: data.emp_level,
          emp_group: data.emp_group,
          emp_post: data.post_id,
          karagar_office: data.current_office_id,
          is_chief: data.is_chief,
          remarks_post: data.remarks
        };
        await insertJd( emp_id, jdPayload, user_id, active_office, connection );
      } catch ( e ) {
        console.error( '❌ Failed to insert job history after update:', e );
      }
    }

    return result;
  } catch ( err ) {
    console.error( "❌ Update error:", err );
    throw err;
  }
}

export {
  insertEmpRoute,
  insertJd,
  updateEmpRoute,
  updateJd,
  deleteJd
};