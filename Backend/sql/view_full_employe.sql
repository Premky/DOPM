CREATE
OR REPLACE VIEW view_full_employe AS
SELECT
    e.id AS emp_id,
    e.emp_type,
    e.sanket_no,
    e.name_in_nepali ,
    e.name_in_english,
    e.gender,
    e.dob,
    e.photo_path,
    e.mobile_no,
    e.email,
    e.join_date,
    e.designation_id, 
    cep.post_name_np AS designation,
    e.is_active,
    e.created_at,
    e.updated_at,
    eph.jd,
    eph.appointment_date_bs,
    eph.appointment_date_ad,
    eph.hajir_miti_bs,
    eph.hajir_miti_ad,
    eph.current_office_id,
    eph.office_id as kaaj_office_id,
    eph.is_office_chief,
    eph.is_current_post,
    el.level_name_np,
    el.emp_rank_np,
    ep.post_name_np,
    esg.service_name_np,
    esg.group_name_np,
    o.letter_address AS current_office_np,
    oo.letter_address AS kaaj_office_np,
    eph.post_id,
    eph.service_group_id,
    eph.level_id
FROM
    employees e
    LEFT JOIN employee_post_history eph ON e.id = eph.employee_id
    LEFT JOIN emp_level el ON eph.level_id = el.id
    LEFT JOIN emp_post ep ON eph.post_id = ep.id
    LEFT JOIN emp_post cep ON e.designation_id = cep.id
    LEFT JOIN emp_service_groups esg ON eph.service_group_id = esg.id
    LEFT JOIN offices o ON eph.current_office_id = o.id
    LEFT JOIN offices oo ON eph.office_id = oo.id
    LEFT JOIN emp_darbandies ed ON ed.level_id = eph.level_id
    AND ed.service_group_id = eph.service_group_id
    AND ed.post_id = eph.post_id