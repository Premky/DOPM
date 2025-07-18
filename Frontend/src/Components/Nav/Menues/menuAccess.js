export const menuAccess = {
  payrole: {
    user: [
      '/payrole/create_payrole',
      '/payrole/payrole_user_check',
    ],
    office_approver: [
      '/payrole/payrole_client_check',      
    ],
    jr_officer: [
      '/payrole/payrole_jr_check',
    ],
    sr_officer: [
      '/payrole/payrole_client_pesh',
    ],
    headoffice_approver: [
      '/payrole/payrole_client_pesh',
    ],
    branch_superadmin: 'all',
    office_superadmin: 'all',
    superadmin: 'all',
  },

  bandi: {
    user: [
      '/bandi/dashboard',
      '/bandi/count_ac_office',
      '/bandi/maskebari',
      '/bandi/create_bandi',
      '/bandi/bandi_details',
      '/bandi/bandi_release',
    ],
    superadmin: 'all',
    null:'all',
    user:'all',
    office_approver:'all',
  },

  kaamdari_subidha: {
    office_superadmin: ['kaamdari_subidha/aantarik_prashasan_table'],
    superadmin: 'all',
  },

  bandi_transfer: {
    office_superadmin: ['bandi_transfer/new_bandi_transfer'],
    superadmin: 'all',
  },

  emp: {
    office_superadmin: [
      '/emp/create_employee',
      '/emp/view_employee',
    ],
    superadmin: 'all',
  }
};
