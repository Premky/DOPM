CREATE
OR REPLACE VIEW view_full_parole AS
SELECT
    bp.id AS bandi_id,
    bp.office_bandi_id,
    bp.bandi_name,
    bp.gender,
    bp.nationality,
    TIMESTAMPDIFF (YEAR, bp.dob_ad, CURDATE()) AS current_age,
    bp.current_office_id,
    p.id AS payrole_id,
    p.status AS payrole_status,
    ps.status_key AS status,
    p.payrole_no_id,
    p.payrole_entry_date,
    p.payrole_count_date,
    p.payrole_reason,
    p.remark,
    p.is_checked,
    p.pyarole_rakhan_upayukat,
    p.dopm_remarks,
    pd.payrole_result,
    ba.wardno,
    ba.bidesh_nagarik_address_details,
    nc.country_name_np,
    ns.state_name_np,
    nd.district_name_np,
    nci.city_name_np,
    ro.office_name_with_letter_address AS recommended_court,
    o.letter_address AS current_office_name,
    pm.mudda_name AS payrole_mudda_name,
    bmd.mudda_id,
    bmd.mudda_no,
    bmd.mudda_name,
    bmd.is_main_mudda,
    bmd.is_last_mudda,
    bmd.vadi,

  --  bmd.thuna_date_bs AS bmd_thuna_date,
  --  bmd.thuna_date_bs,
  --  bmd.release_date_bs AS bmd_release_date,
  --  bmd.release_date_bs,
    bmd.mudda_phesala_antim_office,
    bmd.mudda_phesala_antim_office_date,

    bkd.thuna_date_bs AS bmd_thuna_date,
    bkd.thuna_date_bs,
    bkd.release_date_bs AS bmd_release_date,
    bkd.release_date_bs,
    bkd.hirasat_years, 
    bkd.hirasat_months,
    bkd.hirasat_days
    
FROM
    payroles p
    LEFT JOIN bandi_person bp ON p.bandi_id = bp.id
    LEFT JOIN bandi_address ba ON bp.id = ba.bandi_id
    LEFT JOIN bandi_kaid_details bkd ON bp.id = bkd.bandi_id
    LEFT JOIN np_country nc ON ba.nationality_id = nc.id
    LEFT JOIN np_state ns ON ba.province_id = ns.state_id
    LEFT JOIN np_district nd ON ba.district_id = nd.did
    LEFT JOIN np_city nci ON ba.gapa_napa_id = nci.cid
    LEFT JOIN offices ro ON p.recommended_court_id = ro.id
    LEFT JOIN offices o ON bp.current_office_id = o.id
    LEFT JOIN muddas pm ON p.payrole_mudda_id = pm.id
    LEFT JOIN payrole_decisions pd ON p.id = pd.payrole_id
    LEFT JOIN payrole_status ps ON p.status = ps.id
    LEFT JOIN (
        SELECT
            *
        FROM
            (
                SELECT
                    bmd.bandi_id,
                    bmd.mudda_id,
                    m.mudda_name,
                    bmd.mudda_no,
                    bmd.thuna_date_bs,
                    bmd.release_date_bs,
                    bmd.vadi,
                    bmd.is_main_mudda,
                    bmd.is_last_mudda,
                    bmd.mudda_phesala_antim_office_date,
                    o.office_name_with_letter_address AS mudda_phesala_antim_office,
                    ROW_NUMBER() OVER (
                        PARTITION BY
                            bmd.bandi_id
                        ORDER BY
                            (
                                bmd.is_main_mudda = 1
                                AND bmd.is_last_mudda = 1
                            ) DESC,
                            bmd.id DESC
                    ) rn
                FROM
                    bandi_mudda_details bmd
                    LEFT JOIN muddas m ON bmd.mudda_id = m.id
                    LEFT JOIN offices o ON bmd.mudda_phesala_antim_office_id = o.id
            ) x
        WHERE
            rn = 1
    ) bmd ON bp.id = bmd.bandi_id;