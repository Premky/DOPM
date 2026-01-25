CREATE OR REPLACE VIEW view_bandi_full AS
SELECT
    b.id AS bandi_id,
    b.office_bandi_id,
    b.lagat_no,
    b.enrollment_date_bs,
    b.bandi_status,
    pb.block_name,
    b.bandi_name,
    b.bandi_name_en,
    b.bandi_type,
    b.gender,
    b.dob,
    b.dob_ad,
    TIMESTAMPDIFF (YEAR, b.dob_ad, CURDATE()) AS current_age,
    b.bandi_education,
    b.bandi_huliya,
    b.married_status,
    b.photo_path,
    b.is_active,
    b.nationality,
    b.remarks,
    b.current_office_id,
    b.is_under_facility,
    b.is_under_payrole,

    -- Bandi Office
    bo.letter_address AS bandi_office,
    bo.short_name_en AS bandi_office_en,

    -- Address
    ba.wardno,
    ba.bidesh_nagarik_address_details,
    nc.id AS country_id,
    nc.country_name_np,
    ns.state_name_np,
    nd.district_name_np,
    nci.city_name_np,
    nc.country_name_en,
    ns.state_name_en,
    nd.district_name_en,
    nci.city_name_en,

    -- Mudda
    bmd.mudda_id,
    bmd.mudda_no,
    bmd.mudda_condition,
    bmd.is_main_mudda,
    m.muddas_group_id,
    bmd.mudda_phesala_antim_office_date,
    bmd.vadi,
    m.mudda_name,
    mg.mudda_group_name,
    bmo.office_name_with_letter_address AS mudda_phesala_antim_office,
    bmd.vadi_en,
    m.mudda_name_en,
    mg.mudda_group_name_en,
    bmo.office_name_full_en AS mudda_phesala_antim_office_en,

    -- Kaid
    bkd.hirasat_years,
    bkd.hirasat_months,
    bkd.hirasat_days,
    bkd.thuna_date_bs,
    bkd.release_date_bs,

    -- Punarabedan
    bpdo.office_name_with_letter_address AS punarabedan_office,
    bpd.punarabedan_office_ch_no,
    bpd.punarabedan_office_date,

    -- Fine Summary
    fine_summary_table.fine_summary,

    -- Escape Details
    bed.escaped_from_office_id,
    bed.escape_date_bs,
    bed.escape_method,
    bed.status AS escape_status,
    bed.recapture_date_bs,
    bed.current_office_id AS current_office_id_after_recapture,
    efo.letter_address AS recaptured_office,

    -- Relative Info
    bri.is_dependent,
    bSpouse.relative_name AS spouse_name,
    bSpouse.contact_no AS spouse_contact_no,
    bFather.relative_name AS father_name,
    bFather.contact_no AS father_contact_no,
    bMother.relative_name AS mother_name,
    bMother.contact_no AS mother_contact_no,
    bRelatives.other_relatives,

    -- ID Card
    bicd.card_no,
    git.govt_id_name_np,
    git.govt_id_name_en,

    -- Release Details
    brr.reasons_np AS release_reason,
    brd.karnayan_miti AS release_date,
    brri.relative_name AS release_relative_name,
    brri.relative_address AS release_relative_address,
    brri.contact_no AS release_relative_contact_no,
    brd.remarks AS release_remarks

FROM bandi_person b
LEFT JOIN bandi_address ba ON b.id = ba.bandi_id
LEFT JOIN np_country nc ON ba.nationality_id = nc.id
LEFT JOIN np_state ns ON ba.province_id = ns.state_id
LEFT JOIN np_district nd ON ba.district_id = nd.did
LEFT JOIN np_city nci ON ba.gapa_napa_id = nci.cid

LEFT JOIN bandi_mudda_details bmd ON b.id = bmd.bandi_id
LEFT JOIN muddas m ON bmd.mudda_id = m.id
LEFT JOIN muddas_groups mg ON m.muddas_group_id = mg.id
LEFT JOIN offices bmo ON bmd.mudda_phesala_antim_office_id = bmo.id

LEFT JOIN bandi_kaid_details bkd ON b.id = bkd.bandi_id
LEFT JOIN bandi_punarabedan_details bpd ON b.id = bpd.bandi_id
LEFT JOIN offices bpdo ON bpd.punarabedan_office_id = bpdo.id
LEFT JOIN offices bo ON b.current_office_id = bo.id
LEFT JOIN prison_blocks pb ON b.block_no = pb.id
LEFT JOIN bandi_escape_details bed ON b.id = bed.bandi_id
LEFT JOIN offices efo ON bed.current_office_id = efo.id

LEFT JOIN bandi_relative_info bri ON b.id = bri.bandi_id
LEFT JOIN bandi_release_details brd ON b.id = brd.bandi_id
LEFT JOIN bandi_release_reasons brr ON brd.reason_id=brr.id
LEFT JOIN bandi_relative_info brri ON brd.aafanta_id=brri.id

-- Spouse
LEFT JOIN (
    SELECT bandi_id, relative_name, contact_no
    FROM bandi_relative_info
    WHERE relation_id = 1
) bSpouse ON b.id = bSpouse.bandi_id

-- Father
LEFT JOIN (
    SELECT bandi_id, relative_name, contact_no
    FROM bandi_relative_info
    WHERE relation_id = 2
) bFather ON b.id = bFather.bandi_id

-- Mother
LEFT JOIN (
    SELECT bandi_id, relative_name, contact_no
    FROM bandi_relative_info
    WHERE relation_id = 3
) bMother ON b.id = bMother.bandi_id

-- Other relatives
LEFT JOIN (
    SELECT
        bcp.bandi_id,
        GROUP_CONCAT(
            CONCAT(
                bcp.contact_name,', ',
                bcp.contact_address,
                ' (',
                rt.relation_np,
                ', ',
                IFNULL(bcp.contact_contact_details, 'N/A'),
                ')'
            )
            ORDER BY rt.relation_np
            SEPARATOR ' | '
        ) AS other_relatives
    FROM bandi_contact_person bcp
    LEFT JOIN relationships rt ON bcp.relation_id = rt.id
    WHERE NOT EXISTS (
        SELECT 1
        FROM bandi_relative_info bri2
        WHERE bri2.bandi_id = bcp.bandi_id
          AND bri2.relative_name = bcp.contact_name
          AND IFNULL(bri2.contact_no,'') = IFNULL(bcp.contact_contact_details,'')
    )
    GROUP BY bcp.bandi_id
) bRelatives ON b.id = bRelatives.bandi_id

-- ID Card
LEFT JOIN bandi_id_card_details bicd ON b.id = bicd.bandi_id
LEFT JOIN govt_id_types git ON git.id = bicd.card_type_id

-- Fine summary
LEFT JOIN (
    SELECT
        bfd.bandi_id,
        GROUP_CONCAT(
            DISTINCT CONCAT(
                fine_type,
                ': ',
                amount_fixed,
                ' (तिरेको: ',
                IFNULL(amount_deposited,'0'),
                ', च.नं.: ',
                IFNULL(deposit_ch_no,'N/A'),
                ', कार्यालय: ',
                IFNULL(bfdo.office_name_with_letter_address,'N/A'),
                ')'
            )
            ORDER BY fine_type
            SEPARATOR ' | '
        ) AS fine_summary
    FROM bandi_fine_details bfd
    LEFT JOIN offices bfdo ON bfd.deposit_office = bfdo.id
    GROUP BY bfd.bandi_id
) fine_summary_table ON b.id = fine_summary_table.bandi_id;
