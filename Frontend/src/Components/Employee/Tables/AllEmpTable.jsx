import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import useAllEmployes from "../APIs/useAllEmp";
import ReusableEmpTable from "../ReusableComponents/ReusableEmpTable";
import EmpTableFilters from "./EmpTableFilters";

const AllEmpTable = () => {
  const { records: empRecords = [], loading } = useAllEmployes();

  const [filters, setFilters] = useState( {
    office: "all",
    empType: "all",
    jd: "all",
    isChief: "all",
    search: "",
    sanket_no: "",
  } );

  const columns = useMemo(
    () => [
      { field: "current_office_np", headerName: "कार्यालय" },
      { field: "emp_type", headerName: "कर्मचारी प्रकार" },
      { field: "sanket_no", headerName: "क.स.नं." },
      { field: "level_name", headerName: "तह" },
      { field: "service_group", headerName: "सेवा समुह" },
      { field: "current_post", headerName: "पद" },
      { field: "name", headerName: "नाम (नेपाली)" },
      { field: "appointment_date_bs", headerName: "सुरु नियुक्ती मिति (वि.सं.)" },
      { field: "current_post_appointment_date_bs", headerName: "हालको पदको नियुक्ती मिति (वि.सं.)" },
      { field: "hajir_miti_bs", headerName: "कार्यालयमा हाजिर मिति" },
      { field: "jd", headerName: "दरबन्दी/काज/कामकाज" },
      { field: "kaaj_office", headerName: "काज कार्यालय" },
      { field: "is_office_chief", headerName: "कारागार प्रशासक?" },
    ],
    []
  );

  const normalizedRows = useMemo( () => {
    return empRecords.map( ( emp ) => {
      const firstAppointment = emp.post_history?.find(
        ( p ) => p.jd_type === "नयाँ नियुक्ती"
      );
      const lastPost = emp.last_jd_entry || {};
      const jd = lastPost.jd || "";
      const kaaj_office = jd === "काज" ? lastPost.kaaj_office_np || "" : "";

      return {
        id: emp.id,
        ...emp,
        appointment_date_bs: firstAppointment?.appointment_date_bs || "N/A",
        current_post_appointment_date_bs: lastPost.appointment_date_bs || "N/A",
        hajir_miti_bs: lastPost.hajir_miti_bs || "N/A",
        current_post: lastPost.post_name_np || "",
        jd,
        kaaj_office,
        is_office_chief: lastPost.is_office_chief || "",
        emp_type: emp.emp_type,
        service_group:
          emp.service_name_np && emp.group_name_np
            ? `${ emp.service_name_np }/${ emp.group_name_np }`
            : "N/A",
        level_name:
          emp.level_name_np && emp.emp_rank_np
            ? `${ emp.level_name_np }/${ emp.emp_rank_np }`
            : emp.level_name_np || emp.emp_rank_np || "N/A",

        // Precompute lowercase for filtering
        _nameLower: emp.name?.toLowerCase() || "",
      };
    } );
  }, [empRecords] );

  const filteredRows = useMemo( () => {
    const searchLower = filters.search?.toLowerCase() || "";
    return normalizedRows.filter( ( row ) => {
      if ( filters.office !== "all" && row.current_office_id !== filters.office ) return false;
      if ( filters.empType !== "all" && row.emp_type !== filters.empType ) return false;
      if ( filters.jd !== "all" && row.jd !== filters.jd ) return false;
      if ( filters.isChief !== "all" && String( row.is_office_chief ) !== String( filters.isChief ) ) return false;
      if ( searchLower && !row._nameLower.includes( searchLower ) ) return false;
      if (filters.sanket_no && !row.sanket_no?.toString().includes(filters.sanket_no)) return false;
      return true;
    } );
  }, [normalizedRows, filters] );

  return (
    <div>
      <Helmet>
        <title>सबै कर्मचारी</title>
        <meta name="description" content="सबै कर्मचारी" />
      </Helmet>

      <EmpTableFilters onChange={setFilters} />

      <ReusableEmpTable
        columns={columns}
        rows={filteredRows}
        loading={loading}
        enableExport
        includeSerial
        serialLabel="सि.नं."
      />
    </div>
  );
};

export default AllEmpTable;
