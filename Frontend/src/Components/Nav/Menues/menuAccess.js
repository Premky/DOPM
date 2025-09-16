export const menuAccess = {
  parole: {
    clerk: [
      '/parole/create_payrole',
      '/parole/payrole_user_check',
      '/parole/create_previous_parole',
      '/parole/payrole_log',
    ],
    office_admin: [
      '/parole/create_payrole',
      '/parole/payrole_client_check',
      '/parole/create_previous_parole',
      '/parole/payrole_log',
    ],
    supervisor: [
      '/parole/parole_settings',
      '/parole/payrole_jr_check',
      '/parole/create_previous_parole',
      '/parole/payrole_log',
    ],
    top_level: [
      '/parole/create_payrole',
      '/parole/payrole_user_check',
      '/parole/create_previous_parole',
      '/parole/payrole_log',
    ],
    headoffice_approver: [
      '/parole/payrole_client_pesh',
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
      '/bandi/bandi_escape',
    ],
    clerk: 'all',
    office_admin: 'all',
    superadmin: 'all',
    null: 'all',
    office_superadmin: 'all',
    headoffice_approver: 'all',
    top_level: 'all',
    supervisor: 'all'
  },

  kaamdari_subidha: {
    office_superadmin: ['kaamdari_subidha/aantarik_prashasan_table'],
    superadmin: 'all',
  },

  bandi_transfer: {
    clerk: ['bandi_transfer/new_bandi_transfer'],
    clerk: ['bandi_transfer/approve_bandi_final_transfer'],
    office_admin: ['bandi_transfer/approve_bandi_final_transfer'],
    clerk: 'all',
    office_admin: 'all',
    superadmin: 'all',
    office_superadmin: 'all',
    headoffice_approver: 'all',
    top_level: 'all',
    null: 'all',
    supervisor: 'all'
  },

  emp: {
    office_superadmin: [
      '/emp/create_employee',
      '/emp/view_employee',
    ],
    office_admin: 'all',
    superadmin: 'all',
    clerk: 'all',
  }
};
