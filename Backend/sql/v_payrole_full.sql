CREATE OR REPLACE VIEW v_payrole_full AS
SELECT
    bp.id AS bandi_id,
    bp.office_bandi_id,
    bp.bandi_name,
    bp.gender,
    bp.nationality,
    bp.current_office_id,
    o.office_name_with_letter_address AS current_office_name,

    p.id AS payrole_id,
    p.payrole_no_id,
    p.payrole_status,
    p.payrole_date_bs,
    p.payrole_date_ad,
    p.payrole_rakhan_upayukat,
    p.remarks AS payrole_remarks,

    pd.payrole_result,
    pd.payrole_decision_date_bs,
    pd.payrole_decision_date_ad,
    pd.payrole_decision_remarks,

    bmd.mudda_id,
    m.mudda_name,

    ns.state_name_np AS province_name,
    nd.district_name_np AS district_name,
    nn.gapanapa_name_np AS gapanapa_name,

    bp.created_at,
    bp.updated_at
FROM bandi_person bp
LEFT JOIN payroles p ON bp.id = p.bandi_id
LEFT JOIN payrole_decisions pd ON p.id = pd.payrole_id
LEFT JOIN bandi_mudda_details bmd ON bp.id = bmd.bandi_id
LEFT JOIN muddasection m ON bmd.mudda_id = m.id
LEFT JOIN offices o ON bp.current_office_id = o.id
LEFT JOIN np_state ns ON bp.province_id = ns.id
LEFT JOIN np_district nd ON bp.district_id = nd.id
LEFT JOIN np_gapanapa nn ON bp.gapa_napa_id = nn.id
WHERE bp.deleted_at IS NULL;
