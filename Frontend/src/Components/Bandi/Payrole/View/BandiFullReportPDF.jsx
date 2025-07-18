import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font
} from '@react-pdf/renderer';
import { useBaseURL } from '../../../../Context/BaseURLProvider';
import fetchBandiFamily from '../../Apis_to_fetch/fetchBandiFamily';
import fetchContactPerson from '../../Apis_to_fetch/fetchContactPerson';
import useFetchBandiMudda from '../../Apis_to_fetch/fetchBandiMudda';
import useFetchBandiIdCards from '../../Apis_to_fetch/useFetchBandiIdcards';

Font.register( {
  family: 'Kalimati',
  src: '/fonts/Kalimati_Regular.otf' // Use public or local font path
} );


const styles = StyleSheet.create( {
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
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#e4e4e4",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCell: {
    fontSize: 10,
  },
  photoCol: {
    width: '25%',
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  }


} );

const LabelValue = ( { label, value } ) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || '-'}</Text>
  </View>
);
// { bandi_id, bandiData, kaidData, addressData, idData, muddaData, punrabedanData }
// {bandi_id}
const BandiFullReportPDF = ( { bandiData } ) => {
  const BASE_URL = useBaseURL();
  console.log(BASE_URL)
  const { records: family, optrecords: optFamily, loading: familyLoading, refetch: fetchFamilyRecords } = fetchBandiFamily( bandiData.bandi_id );
  const { records: contact, optrecords: optContact, loading: contactLoading, refetch: fetchContactRecords } = fetchContactPerson( bandiData.bandi_id );
  const { records: bandiMudda, optrecords: optbandiMudda, loading: bandiMuddaLoading, refetch: fetchbandiMuddaRecords } = useFetchBandiMudda( bandiData.bandi_id );
  const { records: bandiIdCard, optrecords: optbandiIdCard, loading: bandiIdCardLoading, refetch: fetchbandiIdCardRecords } = useFetchBandiMudda( bandiData.bandi_id );
  console.log( bandiData );
  return (
    <Document>

      <Page size="A4" style={styles.page}>
        {/* Bandi Section */}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>बन्दीको विवरणः</Text>
        </View>
        <View style={styles.tableRow}>
          {/* Left side info column */}
          <View style={{ flex: 3 }}>
            {/* Row 1 */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>बन्दी आईडी</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.office_bandi_id}</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>नाम</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.bandi_name}</Text></View>
            </View>

            {/* Row 2 */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>लिङ्ग</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.gender}</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>उमेर</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.age}</Text></View>
            </View>

            {/* Row 3 */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>शैक्षिक योग्यता</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.bandi_education}</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>हुलिया</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.bandi_huliya}</Text></View>
            </View>

            {/* Row 4 */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>राष्ट्रियता</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.nationality}(${bandiData.country_name_np})</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCell}>ठेगाना</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>
                {bandiData.nationality === 'स्वदेशी'
                  ? `${ bandiData.city_name_np }-${ bandiData.wardno }, ${ bandiData.district_name_np }`
                  : `${ bandiData.bidesh_nagarik_address_details }`}
              </Text></View>
            </View>
          </View>

          {/* Photo Column */}
          <View style={styles.photoCol}>
            {bandiData.photo_path && (
              <Image
                src={`${ BASE_URL }${ bandiData.photo_path }`}
                style={{ width: 80, height: 100 }}
              />
            )}
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>बन्दीको कैद विवरणः</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>बन्दी प्रकार</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>हिरासत अवधी</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>थुना/कैद परेको मिति</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>छुट्ने मिति</Text></View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.bandi_type}</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.hirasat_years}|{bandiData.hirasat_months}|{bandiData.hirasat_days}</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.thuna_date_bs}</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>{bandiData.release_date_bs}</Text></View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>बन्दीको मुद्दा विवरणः</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>सि.नं.</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>मुद्दा</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>मुद्दा नं.</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>मुद्दा अवस्था</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>मुद्दा फैसला गर्ने निकाय</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>मुद्दा फैसला मिति</Text></View>
        </View>

        {bandiMudda.map( ( item, index ) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.mudda_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.mudda_no}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.mudda_condition == 1 ? 'चालु' : 'अन्तिम भएको' || ''}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.mudda_phesala_antim_office_date}</Text></View>
          </View>
        ) )}

        <View style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>बन्दीको परिचय पत्र विवरणः</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>सि.नं.</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>परिचय पत्र</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>परिचय पत्र नं.</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>जारी जिल्ला</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>जारी मिति</Text></View>
        </View>
        {bandiIdCard.map( ( item, index ) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.govt_id_name_np}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.card_no}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.card_issue_district_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.card_issue_date}</Text></View>
          </View>
        ) )}

        <View style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>बन्दीको पारिवारीक विवरणः</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>सि.नं.</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>नाता</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>नामथर</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>ठेगाना</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>सम्पर्क नं.</Text></View>
        </View>
        {family.map( ( item, index ) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.relation_np}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.relative_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.relative_address}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.contact_no}</Text></View>
          </View>
        ) )}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]}>बन्दीको सम्पर्क व्यक्तीको विवरणः</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>सि.नं.</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>नाता</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>नामथर</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>ठेगाना</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCell}>सम्पर्क नं.</Text></View>
        </View>
        {contact.map( ( item, index ) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.relation_np}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.contact_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.contact_address}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{item.contact_contact_details}</Text></View>
          </View>
        ) )}
      </Page>
    </Document>
  );
};

export default BandiFullReportPDF;



{/* ID Section */ }
{/* <View style={styles.section}>
        <Text style={styles.heading}>पहिचान विवरण</Text>
        {idData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="कागजात" value={item.card_type_name} />
            <LabelValue label="नम्बर" value={item.card_number} />
          </View>
        ))}
      </View> */}

{/* Mudda Section */ }
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

{/* Punrabedan Section */ }
{/* <View style={styles.section}>
        <Text style={styles.heading}>पुनरावेदन विवरण</Text>
        {punrabedanData?.map((item, index) => (
          <View key={index}>
            <LabelValue label="पुनरावेदन मिति" value={item.date_np} />
            <LabelValue label="कारण" value={item.reason} />
          </View>
        ))}
      </View> */}