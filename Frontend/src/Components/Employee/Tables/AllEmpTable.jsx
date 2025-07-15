import React from 'react';

import useAllEmployes from '../APIs/useAllEmp';
import ReusableTable from '../../ReuseableComponents/ReuseTable';
import ReusableBandiTable from '../../Bandi/ReusableComponents/ReusableBandiTable';
import ReusableEmpTable from '../ReusableComponents/ReusableEmpTable';
const AllEmpTable = () => {

  const columns = [
    { field: "current_office_np", headerName: "कार्यालय" },
    { field: "sanket_no", headerName: "क.स.नं." },
    { field: "level_name", headerName: "तह" },
    { field: "service_group", headerName: "सेवा समुह" },
    { field: "post_name_np", headerName: "पद" },
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


  const { records: empRecords, optrecords, loading } = useAllEmployes();
  console.log( 'Employee Records:', empRecords );
  const rows = empRecords.map( ( emp ) => ( {
    ...emp,
    id: emp.id,
    service_group: emp.service_name_np && emp.group_name_np
      ? `${ emp.service_name_np }/${ emp.group_name_np }`
      : 'N/A',
    level_name: emp.level_name_np && emp.emp_rank_np
      ? `${ emp.level_name_np }/${ emp.emp_rank_np }`
      : emp.level_name_np ? emp.level_name_np
        : emp.emp_rank_np ? emp.emp_rank_np: 'N/A',
  } ) );

  return (
    <div>

      <ReusableEmpTable
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
      />
    </div>
  );
};

export default AllEmpTable;