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
                is_active, photo_path, remarks,
                created_by, updated_by, created_at, updated_at, current_office_id
                ) VALUES (?)`;
        const values = [
            data.emp_type, data.sanket_no, data.name_in_nepali, data.name_in_english,
            data.gender, data.dob, dob_ad, data.married_status, data.mobile_no, data.email,
            data.citizenship_no, data.issue_date, data.issue_district, 
            1, data.photo_path, data.remarks,
            data.user_id, data.user_id, new Date(), new Date(),
            data.active_office
        ];
        // const result = await queryAsync( sql, [values] );
        const [result] = await connection.query( sql, [values] );
        console.log( "✅ Insert result:", result );
        return result.affectedRows || 0;
    } catch ( err ) {
        console.error( "❌ SQL/Insert error:", err ); // <-- logs real SQL or DB issues
        throw err;
    }
}

async function insert( bandi_id, data ) {

  // const defaultDate = '1950-01-01';

  const hirasatBs = data.hirasat_date_bs;
  const releaseBs = data.release_date_bs;

  let thunaAd;
  let releaseAd;
  if ( hirasatBs ) {
    // thunaAd = data.hirasatBs;
    thunaAd = data.hirasatBs && await bs2ad( data?.hirasat_date_bs );
  }
  if ( releaseBs ) {
    releaseAd = data.releaseBs && await bs2ad( data?.release_date_bs );
  }

  const baseValues = [
    bandi_id,
    data.hirasat_years,
    data.hirasat_months,
    data.hirasat_days,
    hirasatBs,
    thunaAd
  ];

  const auditFields = [data.user_id, data.user_id, data.office_id];

  let values, sql;

  if ( releaseBs ) {
    values = [...baseValues, data.is_life_time, releaseBs, releaseAd, ...auditFields];
    sql = `INSERT INTO bandi_kaid_details (
    bandi_id, hirasat_years, hirasat_months, hirasat_days, thuna_date_bs,  thuna_date_ad, is_life_time,
    release_date_bs, release_date_ad,
    created_by, updated_by, current_office_id
  ) VALUES (?)`;
  } else {
    values = [...baseValues, ...auditFields];
    sql = `INSERT INTO bandi_kaid_details (
    bandi_id, hirasat_years, hirasat_months, hirasat_days, thuna_date_bs,  thuna_date_ad,
    created_by, updated_by, current_office_id
  ) VALUES (?)`;
  }
  // await queryAsync( sql, [values] );
  const [result] = await connection.query( sql, [values] );
}

export {
    insertEmpRoute
};