CREATE OR REPLACE VIEW view_full_bandi_transfer AS
SELECT 
    bth.id AS transfer_id,
    bth.bandi_id,
    bth.role_id,
    bth.status_id,
    bth.transfer_from_office_id,
    bth.recommended_to_office_id,
    bth.final_to_office_id,
    bth.transfer_reason_id,
    btr.transfer_reason_np,
    bth.transfer_reason,
    bth.decision_date,
    bth.transfer_from_date,
    bth.transfer_to_date,
    bth.remarks,
    bth.is_completed,
    bth.bandi_character,

    bp.office_bandi_id,
    bp.bandi_type,
    bp.bandi_name,
    bp.dob,
    bp.dob_ad,
    bp.current_office_id,
    bp.is_active,

    TIMESTAMPDIFF(YEAR, bp.dob_ad, CURDATE()) AS current_age,

    vbad.country_name_np,
    vbad.bidesh_nagarik_address_details,
    vbad.nepali_address,

    bkd.thuna_date_bs,
    bkd.release_date_bs,

    o.letter_address AS current_office_name,
    oo.letter_address AS transfer_from_office_name,
    ooo.letter_address AS recommended_to_office_name,
    oooo.letter_address AS final_to_office_name,

    bmd.mudda_id,
    m.mudda_name

    
FROM bandi_transfer_history bth
LEFT JOIN bandi_person bp ON bth.bandi_id = bp.id
LEFT JOIN view_bandi_address_details vbad ON bp.id = vbad.bandi_id
LEFT JOIN bandi_kaid_details bkd ON bp.id = bkd.bandi_id
LEFT JOIN offices o ON bp.current_office_id = o.id
LEFT JOIN offices oo ON bth.transfer_from_office_id = oo.id
LEFT JOIN offices ooo ON bth.recommended_to_office_id = ooo.id
LEFT JOIN offices oooo ON bth.final_to_office_id = oooo.id
LEFT JOIN bandi_mudda_details bmd ON bp.id = bmd.bandi_id
LEFT JOIN muddas m ON bmd.mudda_id = m.id
LEFT JOIN bandi_transfer_reasons btr ON bth.transfer_reason_id = btr.id;
