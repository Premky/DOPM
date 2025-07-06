// services/bandiService.js

//गाडीका विवरणहरुः नाम सुची
// Promisify specific methods
import con from '../utils/db.js';
import { promisify } from 'util';
const queryAsync = promisify( con.query ).bind( con );
const beginTransactionAsync = promisify( con.beginTransaction ).bind( con );
const commitAsync = promisify( con.commit ).bind( con );
const rollbackAsync = promisify( con.rollback ).bind( con );
const query = promisify( con.query ).bind( con );

import { bs2ad } from '../utils/bs2ad.js';

async function insertBandiPerson( data ) {
  const dob_ad = await bs2ad( data.dob );
  const values = [
    data.bandi_type, data.office_bandi_id, data.lagat_no, data.nationality, data.bandi_name,
    data.gender, data.dob, dob_ad, data.age, data.married_status, data.photo_path,
    data.bandi_education, data.bandi_height, data.bandi_weight, data.bandi_huliya,
    data.bandi_remarks, data.user_id, data.user_id, data.office_id
  ];

  const sql = `INSERT INTO bandi_person (
    bandi_type, office_bandi_id,lagat_no, nationality, bandi_name, gender, dob, dob_ad, age, married_status, photo_path,
    bandi_education, height, weight, bandi_huliya, remarks, created_by, updated_by, current_office_id
  ) VALUES (?)`;

  const result = await queryAsync( sql, [values] );
  return result.insertId;
}

async function insertKaidDetails( bandi_id, data ) {

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
    data.hirasatBs,
    thunaAd
  ];

  const auditFields = [data.user_id, data.user_id, data.office_id];

  let values, sql;

  if ( releaseBs ) {
    values = [...baseValues, releaseBs, releaseAd, ...auditFields];
    sql = `INSERT INTO bandi_kaid_details (
    bandi_id, hirasat_years, hirasat_months, hirasat_days, thuna_date_bs, thuna_date_ad,
    release_date_bs, release_date_ad,
    created_by, updated_by, current_office_id
  ) VALUES (?)`;
  } else {
    values = [...baseValues, ...auditFields];
    sql = `INSERT INTO bandi_kaid_details (
    bandi_id, hirasat_years, hirasat_months, hirasat_days, thuna_date_bs, thuna_date_ad,
    created_by, updated_by, current_office_id
  ) VALUES (?)`;
  }
  await queryAsync( sql, [values] );
}

async function insertCardDetails( bandi_id, data ) {
  const values = [
    bandi_id, data.id_card_type, data.card_name, data.card_no,
    data.card_issue_district_id, data.card_issue_date, data.user_id, data.office_id
  ];
  const sql = `INSERT INTO bandi_id_card_details (
    bandi_id, card_type_id, card_name, card_no, card_issue_district, card_issue_date, created_by, current_office_id
  ) VALUES (?)`;
  await queryAsync( sql, [values] );
}

async function insertAddress( bandi_id, data ) {
  let sql, values;
  const isNepali = Number( data.nationality_id ) === 1;

  if ( isNepali ) {
    values = [
      bandi_id,
      data.nationality_id,
      data.state_id,
      data.district_id,
      data.municipality_id,
      data.wardno,
      data.user_id,
      data.user_id,
      data.office_id
    ];
    sql = `INSERT INTO bandi_address (
      bandi_id, nationality_id, province_id, district_id,
      gapa_napa_id, wardno,
      created_by, updated_by, current_office_id
    ) VALUES (?)`;
  } else {
    values = [
      bandi_id,
      data.nationality_id,
      data.bidesh_nagrik_address_details,
      data.user_id,
      data.user_id,
      data.office_id
    ];
    sql = `INSERT INTO bandi_address (
      bandi_id, nationality_id, bidesh_nagarik_address_details,
      created_by, updated_by, current_office_id
    ) VALUES (?)`;
  }

  await queryAsync( sql, [values] );
}

async function insertMuddaDetails1( bandi_id, muddas, office_id ) {
  const sql = `INSERT INTO bandi_mudda_details (
    bandi_id, mudda_id, mudda_no, is_last_mudda, is_main_mudda,
    mudda_condition, mudda_phesala_antim_office_district,
    mudda_phesala_antim_office_id, mudda_phesala_antim_office_date, vadi, current_office_id
  ) VALUES (?)`;

  for ( const m of muddas ) {
    const values = [
      bandi_id, m.mudda_id, m.mudda_no, m.is_last, m.is_main,
      m.condition, m.district, m.office, m.date, m.vadi, office_id
    ];
    await queryAsync( sql, [values] );
  }
}

async function insertMuddaDetails(bandi_id, muddas = [], office_id) {
  const sql = `INSERT INTO bandi_mudda_details (
    bandi_id, mudda_id, mudda_no, is_last_mudda, is_main_mudda,
    mudda_condition, mudda_phesala_antim_office_district,
    mudda_phesala_antim_office_id, mudda_phesala_antim_office_date, vadi, current_office_id
  ) VALUES (?)`;

  for (const m of muddas) {
    // 🛑 Skip this mudda if mudda_id is missing or empty
    if (!m.mudda_id) continue;

    const values = [
      bandi_id,
      m.mudda_id,
      m.mudda_no,
      m.is_last,
      m.is_main,
      m.condition,
      m.district,
      m.office,
      m.date,
      m.vadi,
      office_id
    ];
    await queryAsync(sql, [values]);
  }
}

async function insertFineDetails( bandi_id, fines, user_id, office_id ) {
  // console.log(fines)
  for ( const fine of fines ) {
    let sql, values;

    const isFixed = Number( fine.is_fine_fixed ) === 1;
    const isPaid = Number( fine.is_fine_paid ) === 1;

    if ( isFixed && isPaid ) {
      sql = `INSERT INTO bandi_fine_details (
        bandi_id, fine_type, amount_fixed, amount_deposited,
        deposit_office, deposit_district, deposit_ch_no,
        deposit_date, deposit_amount,
        created_by, updated_by, current_office_id
      ) VALUES (?)`;
      let depositAmount = fine.amount;

      if (
        depositAmount === undefined ||
        depositAmount === null ||
        depositAmount.toString().trim() === '' ||
        isNaN( Number( depositAmount ) )
      ) {
        depositAmount = null;
      } else {
        depositAmount = Number( depositAmount );
      }

      values = [
        bandi_id,
        fine.type,
        fine.is_fine_fixed,
        fine.is_fine_paid,
        fine.fine_paid_office,
        fine.fine_paid_office_district,
        fine.fine_paid_cn,
        fine.fine_paid_date,
        // fine.amount,
        depositAmount,
        user_id,
        user_id,
        office_id
      ];
    } else {
      sql = `INSERT INTO bandi_fine_details (
        bandi_id, fine_type, amount_fixed,
        created_by, updated_by, current_office_id
      ) VALUES (?)`;

      values = [
        bandi_id,
        fine.type,
        fine.is_fine_fixed,
        user_id,
        user_id,
        office_id
      ];
    }

    await queryAsync( sql, [values] );
  }
}

async function insertPunarabedan( bandi_id, data ) {
  if ( !data.punarabedan_office_id && !data.punarabedan_office_district ) return;
  const values = [
    bandi_id, data.punarabedan_office_id, data.punarabedan_office_district,
    data.punarabedan_office_ch_no, data.punarabedan_office_date
  ];
  const sql = `INSERT INTO bandi_punarabedan_details (...) VALUES (?)`;
  await queryAsync( sql, [values] );
}


async function insertFamily(bandi_id, family = [], user_id, office_id) {
  if (!family.length) return;

  // Filter out family members where relation_id is undefined or blank
  const validFamily = family.filter(f => f.bandi_relative_relation !== undefined && f.bandi_relative_relation !== '');

  // If after filtering, there are no valid family members, don't insert anything
  if (!validFamily.length) return;

  const values = validFamily.map(f => [
    bandi_id,
    f.bandi_relative_name,
    f.bandi_relative_relation,
    f.bandi_relative_address,
    f.bandi_relative_dob,
    f.is_dependent,
    f.bandi_relative_contact_no,
    user_id,
    user_id,
    office_id
  ]);

  const sql = `INSERT INTO bandi_relative_info (
    bandi_id, relative_name, relation_id, relative_address, dob, is_dependent, contact_no,
    created_by, updated_by, current_office_id
  ) VALUES ?`;

  await queryAsync(sql, [values]);
}

async function insertContacts(bandi_id, contacts = [], user_id, office_id) {
  if (!contacts.length) return;

  // Filter out contacts with missing or blank relation_id
  const filteredContacts = contacts.filter(c =>
    typeof c.relation_id === 'string' && c.relation_id.trim() !== ''
  );

  if (!filteredContacts.length) return;

  const values = filteredContacts.map(c => [
    bandi_id,
    c.relation_id,
    c.contact_name,
    c.contact_address,
    c.contact_contact_details,
    user_id,
    user_id,
    office_id
  ]);

  const sql = `INSERT INTO bandi_contact_person (
    bandi_id, relation_id, contact_name, contact_address,
    contact_contact_details, created_by, updated_by, current_office_id
  ) VALUES ?`;

  await queryAsync(sql, [values]);
}



async function insertContacts1( bandi_id, contacts = [], user_id, office_id ) {
  if ( !contacts.length ) return;
  const values = contacts.map( c => [
    bandi_id, c.relation_id, c.contact_name, c.contact_address,
    c.contact_contact_details, user_id, user_id, office_id
  ] );
  const sql = `INSERT INTO bandi_contact_person (
    bandi_id, relation_id, contact_name, contact_address,
    contact_contact_details, created_by, updated_by, current_office_id
  ) VALUES ?`;
  await queryAsync( sql, [values] );
}

async function insertHealthInsurance( bandi_id, health_insurance = [], user_id, office_id ) {
  if ( !health_insurance.length ) return;
  const values = health_insurance.map( c => [
    bandi_id, c.is_active, c.insurance_from, c.insurance_to, user_id, office_id
  ] );
  const sql = `INSERT INTO bandi_health_insurance (
    bandi_id, is_active, insurance_from, insurance_to,
    created_by, current_office_id
  ) VALUES ?`;
  await queryAsync( sql, [values] );
}

export {
  insertBandiPerson,
  insertKaidDetails,
  insertCardDetails,
  insertAddress,
  insertMuddaDetails,
  insertFineDetails,
  insertPunarabedan,
  insertFamily,
  insertContacts,
  insertHealthInsurance
};