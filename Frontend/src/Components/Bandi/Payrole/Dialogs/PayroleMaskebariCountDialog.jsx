import {
  Box,
  Button,
  DialogTitle,
  Dialog,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import ReuseInput from '../../../ReuseableComponents/ReuseInput';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useBaseURL } from '../../../../Context/BaseURLProvider';
import nepaliYearsMonths from '../../../../../Utils/nepaliYearsMonths';
import ReuseSelect from '../../../ReuseableComponents/ReuseSelect';
import NepaliDate from 'nepali-datetime';
import { useAuth } from '../../../../Context/AuthContext';

const PayroleMaskebariCountDialog = ({ open, onClose, data, onSave }) => {
  const BASE_URL = useBaseURL();
  const { state: authState } = useAuth();
  const npToday = new NepaliDate();

  const isEdit = Boolean(data?.id);

  const today = new NepaliDate(npToday.toString());

  const {
    
    handleSubmit,
    reset,
    control,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      year_bs: today.year,
      month_bs: today.month,
      office_id: authState.office_id
    }
  });

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const totalFields = [
    'total_decision_count',
    'total_payrole_count',
    'total_no_from_court_count',
    'total_bhuktan_count',
    'total_current_payrole_count',
    'total_in_district_wise_count',
    'total_out_district_wise_count',
    'total_no_payrole_count',
    'total_payrole_regulation'
  ];

  totalFields.forEach((baseField) => {
    useEffect(() => {
      const male = parseInt(watch(`${baseField}_male`)) || 0;
      const female = parseInt(watch(`${baseField}_female`)) || 0;
      const other = parseInt(watch(`${baseField}_other`)) || 0;
      setValue(baseField, male + female + other);
    }, [watch(`${baseField}_male`), watch(`${baseField}_female`), watch(`${baseField}_other`)]);
  });

  const onSubmit = async (formValues) => {
    try {
      const url = `${BASE_URL}/bandi/create_payrole_maskebari_count${isEdit ? `/${data.id}` : ''}`;
      const method = isEdit ? 'put' : 'post';

      await axios[method](url, formValues, { withCredentials: true });

      Swal.fire(
        isEdit ? 'अपडेट भयो' : 'थपियो',
        isEdit ? 'रेकर्ड सफलतापूर्वक अपडेट भयो' : 'रेकर्ड सफलतापूर्वक थपियो',
        'success'
      );
      onSave();
      onClose();
    } catch (error) {
      console.error('Submit Error:', error);
      Swal.fire('त्रुटि', 'सेभ गर्न सकिएन', 'error');
    }
  };

  const handleDelete = async () => {
    if (!data?.id) return;

    const result = await Swal.fire({
      title: 'के तपाईं पक्का डिलिट गर्न चाहनुहुन्छ?',
      text: 'यो कार्य पछि फर्कन सकिँदैन!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'हो, डिलिट गर!',
      cancelButtonText: 'रद्द गर्नुहोस्'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/bandi/payrole_maskebari_count/${data.id}`, { withCredentials: true });
      Swal.fire('डिलिट भयो', 'रेकर्ड सफलतापूर्वक डिलिट भयो', 'success');
      onSave();
      onClose();
    } catch (error) {
      console.error('Delete Error:', error);
      Swal.fire('त्रुटि', 'डिलिट गर्न सकिएन', 'error');
    }
  };

  const rows = [
    { label: 'प्यारोल बोर्डबाट निर्णय भएको कुल संख्या', field: 'total_decision_count' },
    { label: 'हाल सम्म प्यारोलमा रहेका कुल संख्या', field: 'total_payrole_count' },
    { label: 'अदालतबाट नमिल्ने आदेश भएका संख्या', field: 'total_no_from_court_count' },
    { label: 'कैद भुक्तान भएका संख्या', field: 'total_bhuktan_count' },
    { label: 'हाल प्यारोलमा रहेका जम्मा संख्या', field: 'total_current_payrole_count' },
    { label: 'भित्रिएका जिल्लागत कैदी संख्या', field: 'total_in_district_wise_count' },
    { label: 'बाहिरिएका जिल्लागत कैदी संख्या', field: 'total_out_district_wise_count' },
    { label: 'शर्त पालना नगर्नेको संख्या', field: 'total_no_payrole_count' },
    { label: 'शर्त पालना गर्नेको संख्या', field: 'total_payrole_regulation'}
  ];

  const [selectedYear, setSelectedYear] = useState(today.year)
  const [selectedMonth, setSelectedMonth] = useState(today.month)
  const [selectedOffice, setSelectedOffice] = useState(authState.office_id)

  useEffect(() => {
    const today = new NepaliDate();
    setValue('year_bs', today.year);
    setValue('month_bs', today.month);
    setValue('office_id', selectedOffice);
  }, []);
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>प्यारोल अवस्था </DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid size={12}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Controller
                        name="office_id"
                        control={control}
                        defaultValue={authState.office_id}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id="office_label">Office</InputLabel>
                            <Select
                              labelId="office_label"
                              id="office_id"
                              label="साल"
                              {...field}
                            >
                              <MenuItem key={authState.office_id} value={authState.office_id}>
                                {authState.office_np}
                              </MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name="year_bs"
                        control={control}
                        defaultValue={today.year}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id="year_bs_label">साल</InputLabel>
                            <Select labelId="year_bs_label" id="year_bs" label="साल" {...field}>
                              {nepaliYearsMonths.yearoptions.map((y) => (
                                <MenuItem key={y.value} value={y.value}>
                                  {y.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name="month_bs"
                        control={control}
                        defaultValue={today.month}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id="month_bs_label">महिना</InputLabel>
                            <Select labelId="month_bs_label" id="month_bs" label="महिना" {...field}>
                              {nepaliYearsMonths.monthsoptions.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                  {m.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>प्यारोल सम्बन्धमा</TableCell>
                    <TableCell>पुरुष</TableCell>
                    <TableCell>महिला</TableCell>
                    <TableCell>अन्य</TableCell>
                    <TableCell>जम्मा</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(({ label, field }) => (
                    <TableRow key={field}>
                      <TableCell>{label}</TableCell>
                      <TableCell><ReuseInput name={`${field}_male`} control={control} /></TableCell>
                      <TableCell><ReuseInput name={`${field}_female`} control={control} /></TableCell>
                      <TableCell><ReuseInput name={`${field}_other`} control={control} /></TableCell>
                      <TableCell><ReuseInput name={field} control={control} readonly={true}/></TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>Remarks</TableCell>
                    <TableCell colSpan={4}><ReuseInput name='remarks' control={control} /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {isEdit && <Button color="error" onClick={handleDelete}>डिलिट गर्नुहोस्</Button>}
        <Button onClick={onClose}>रद्द गर्नुहोस्</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">सेभ गर्नुहोस्</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayroleMaskebariCountDialog;
