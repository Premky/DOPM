import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

// Optional: Set default font
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: 'https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxK.woff2' }
//   ]
// });

Font.register({
  family: 'Kalimati',
  src: '/fonts/Kalimati_Regular.otf' // Use public or local font path
});


const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: 'Kalimati',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textDecoration: 'underline'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: '30%',
    fontWeight: 'bold'
  },
  value: {
    width: '70%',
  }
});

const LabelValue = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);
// { bandi_id, bandiData, kaidData, addressData, idData, muddaData, punrabedanData }
// {bandi_id}
const BandiFullReportPDF = () => (
  <Document>
    
    <Page size="A4" style={styles.page}>
      {/* Bandi Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>बन्दी विवरण </Text>
        {/* <LabelValue label="बन्दी आईडी" value={bandiData.office_bandi_id} />
        <LabelValue label="नामथर" value={bandiData.bandi_name} />
        <LabelValue label="लिङ्ग" value={bandiData.gender} />
        <LabelValue label="जन्म मिति" value={bandiData.dob} />
        <LabelValue label="वैवाहिक स्थिति" value={bandiData.married_status} />
        <LabelValue label="शैक्षिक योग्यता" value={bandiData.bandi_education} />
        <LabelValue label="हुलिया" value={bandiData.bandi_huliya} /> */}
      </View>

      
    </Page>
  </Document>
);

export default BandiFullReportPDF;

{/* Kaid Section */}
      {/* <View style={styles.section}>
        <Text style={styles.heading}>कैद विवरण</Text>
        {kaidData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="थुनाको मिति" value={item.thuna_miti} />
            <LabelValue label="कैद अवधि" value={item.kaid_saja} />
            <LabelValue label="कैद प्रकार" value={item.kaid_type} />
          </View>
        ))}
      </View> */}

      {/* Address Section */}
      {/* <View style={styles.section}>
        <Text style={styles.heading}>ठेगाना विवरण</Text>
        {addressData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="प्रदेश" value={item.province_name} />
            <LabelValue label="जिल्ला" value={item.district_name} />
            <LabelValue label="गा.पा/न.पा" value={item.municipality_name} />
            <LabelValue label="वडा नं" value={item.ward_no} />
          </View>
        ))}
      </View> */}

      {/* ID Section */}
      {/* <View style={styles.section}>
        <Text style={styles.heading}>पहिचान विवरण</Text>
        {idData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="कागजात" value={item.card_type_name} />
            <LabelValue label="नम्बर" value={item.card_number} />
          </View>
        ))}
      </View> */}

      {/* Mudda Section */}
      {/* <View style={styles.section}>
        <Text style={styles.heading}>मुद्दा विवरण</Text>
        {muddaData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="मुद्दा" value={item.mudda_name} />
            <LabelValue label="मुद्दा नं." value={item.mudda_no} />
            <LabelValue label="स्थिति" value={item.mudda_condition == 1 ? 'चालु' : 'अन्तिम' } />
            <LabelValue label="फैसला मिति" value={item.mudda_phesala_antim_office_date} />
          </View>
        ))}
      </View> */}

      {/* Punrabedan Section */}
      {/* <View style={styles.section}>
        <Text style={styles.heading}>पुनरावेदन विवरण</Text>
        {punrabedanData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="पुनरावेदन मिति" value={item.date_np} />
            <LabelValue label="कारण" value={item.reason} />
          </View>
        ))}
      </View> */}