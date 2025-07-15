import React from 'react';

import useAllEmployes from '../APIs/useAllEmp';
import ReusableTable from '../../ReuseableComponents/ReuseTable';
import ReusableBandiTable from '../../Bandi/ReusableComponents/ReusableBandiTable';
const AllEmpTable = () => {

  const columns = [
    { field: "current_office_np", headerName: "कारागार कार्यालय)" },
    { field: "sanket_no", headerName: "क.स.नं." },
    { field: "level_id", headerName: "तह" },
    { field: "service_group_id", headerName: "सेवा समुह" },
    { field: "post_id", headerName: "पद" },
    { field: "name_in_nepali", headerName: "नाम (नेपाली)" },
    { field: "appointment_date_bs", headerName: "सुरु नियुक्ती मिति(वि.सं.)" },
    { field: "current_post_appointment_date_bs", headerName: "हालको पदको नियुक्ती मिति (वि.सं.)" },
    { field: "transfer_date_bs", headerName: "कार्यालयमा सरुवा/पदस्थापन भएको निर्णय मिति" },
    { field: "office_present_date", headerName: "कार्यालयमा हाजिर मिति" },
    { field: "jd", headerName: "दरबन्दी/काज/कामकाज" },
    { field: "kaaj_office", headerName: "काजमा भए पदाधिाकर रहेको निकाय" },
    { field: "approved_darbandi", headerName: "स्विकृत दरबन्दी" },
    { field: "working_count", headerName: "कार्यरत" },
    { field: "rikt", headerName: "रिक्त" },
    { field: "is_office_chief", headerName: "कारागार प्रशासक?" },
  ];


  const { records:empRecords, optrecords, loading } = useAllEmployes();
  console.log('Employee Records:', empRecords);
  const rows = empRecords.map((emp) => ({
    ...emp,
    id: emp.id,
    name_in_nepali: emp.name_in_nepali || 'N/A',
    name_in_english: emp.name_in_english || 'N/A',
    sanket_no: emp.sanket_no || 'N/A',
    emp_type: emp.emp_type || 'N/A',  
  }));

  return (
    <div>

      {/* <ReusableTable
        columns={columns}
        rows={rows}
        loading={loading}
        showView
        showEdit
        // onView={handleView}
        // onEdit={handleEdit}
        enableExport
        includeSerial
        serialLabel="सि.नं."
      /> */}
    </div>
  );
};

export default AllEmpTable;