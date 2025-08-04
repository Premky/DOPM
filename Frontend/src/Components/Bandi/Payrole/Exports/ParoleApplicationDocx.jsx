// MyDocGenerator.js
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, WidthType, TableRow, TableCell, BorderStyle } from "docx";
import { Button } from "@mui/material";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import NepaliDate from 'nepali-datetime';
const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
export default function ParoleApplicationDocx( props ) {
    const { data } = props;
    // console.log( data );
    let address;
    if ( data?.nationality == 'विदेशी' ) {
        address = `${ data?.bidesh_nagarik_address_details },${ data?.country_name_np }`;
    } else if ( data?.nationality == 'स्वदेशी' ) {
        address = `${data.city_name_np, data.district_name_np, data.district_name_np, data.state_name_np, data.country_name_np}`;
    }
    let mudda_name;
    if ( data?.muddas ) {
        const muddas = data.muddas;
        muddas.map( ( m, i ) => {
            if ( mudda_name ) {
                mudda_name += ',' + m.mudda_name;
            } else {
                mudda_name = m.mudda_name;
            }
        } );
    }
    const generateDocument = async () => {
        const doc = new Document( {
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Kalimati",
                            size: 22
                        }
                    },
                    spacing: {
                        line: 240,
                        lineRule: "auto", // or "atLeast", "exact"
                    },
                }
            },
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: "portrait",
                                width: 11906,
                                height: 16838,
                            }
                        }
                    },
                    children: [
                        new Paragraph( {
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun( { text: "अनुसूची", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "(दफा १२ को उपदफा (१) सँग सम्बन्धित)", bold: true } ),
                            ],
                        } ),
                        new Paragraph( {
                            children: [
                                new TextRun( { text: "श्री संघीय प्रोवेशन तथा प्यारोल बोर्ड,", bold: true } ),
                                new TextRun( { text: "काठमाडौं ।", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "मार्फत श्रीमान् प्यारोल अधिकृत,", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: `कारागार कार्यालय,${ data.letter_address } ।`, bold: true } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun( { text: "विषय:- प्यारोलमा बस्ने सिफारिस पाउँ ।", bold: true } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.JUSTIFY,
                            children: [
                                new TextRun( {
                                    text: `म निवेदक देहाय बमोजिमको विवरण तथा संलग्न कागजात सहित प्यारोलमा जिल्ला ${ data.recommended_district } ${ data.recommended_city }मा बस्न पाउँनका लागि श्री .............. जिल्ला अदालत समक्ष सिफारिस गरि पाउन सादर अनुरोध गर्दछु ।`,
                                    size: 20
                                } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.JUSTIFY,
                            children: [
                                new TextRun( {
                                    text: `१. निवेदकको पुरा नाम, थर र ठेगानाः- `,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ data.bandi_name }, ${ address }`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `२. मुद्दाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ mudda_name }`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `३. वादीको नामर, थर ठेगानाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ data.muddas[0].vadi }`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `४. प्रतिवादीहरुको नाम, थर र ठेगानाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ data.muddas[0].vadi }`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `५. मुद्दा फैसला गर्ने अदालतः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ data.muddas[0].office_name_with_letter_address }, ${ data.muddas[0].mudda_phesala_antim_office_date }`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `६. कसूर ठहर भई तोकिएको सजायः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ calculateBSDate( data.thuna_date_bs, data.release_date_bs ).formattedDuration }`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `७. वादी नेपाल सरकारको पुनरावेदन कारवाही सम्बन्धी विवरणः-`,
                                    size: 20,
                                    bold: true
                                } ),

                                new TextRun( {
                                    text: ` ${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ । `,
                                    size: 20
                                } ),

                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `८. प्रतिवादीहरुको पुनरावेदन कारवाही सम्बन्धी विवरणः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `पुनरावेदन सम्बन्धी कुनै काम कारवाही गरेको छैन ।`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `९. हालसम्म भुक्तान गरेको सजायः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${ calculateBSDate( data.thuna_date_bs, current_date ).formattedDuration } (${ calculateBSDate( data.thuna_date_bs, current_date, calculateBSDate( data.thuna_date_bs, data.release_date_bs ) ).percentage }%)`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `१०. प्यारोलमा बस्न दिनुपर्ने आधार र औचित्यः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `मबाट यो कसुर अन्जानबस पहिलो पटक भएको हो । अब उप्रान्त भविष्यमा कुनै पनि कसूरजन्य कार्य गर्ने र गराउने छैन । समाजमा घुलमिल भई परिवारका साथ एक असल नागरिक भई सामाजिक जीवनयापन गर्ने प्रतिवद्धता व्यक्त गर्दछु । हाल कारागारमा असल चालचलनका साथ कैद जीवन विताईरहेको छु । मैले सम्मानित अदालतको फैसला बमोजिम तिर्नु/बुझाउनु पर्ने क्षतिपुर्ति/जरिवाना/विगो/पिडित राहत कोष रकम नियमानुसार बुझाएको छु ।`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `११. कैदिलाई प्रोवेशन तथा प्यारोलमा राख्ने मापदण्ड तथा प्रोवेशन तथा प्यारोलमा छुट्ने कसूरदारले पालना ग्रनुपर्ने शर्तहरु यस बमोजिम निर्धारित शर्तहरु पूर्णरुपमा पालना गर्नेछु।`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `१२. कसूरदार तथा कैदीको स्वघोषणाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `प्यारोलमा रहँदा कुनै पनि किसिमको कसूरजन्य क्रियाकलापमा संलग्न हुने छैन । कुनै कसूरमा संलग्न भएमा प्रोवेशन तथा प्यारोल सुविधाबाट बञ्चित भई कानून बमोजिम सजाय भोग्न तयार छु ।`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `१३. म आफूले गरेको कसूरको लागि प्रायश्चित गर्दै क्षमायाचना गर्दछु ।`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `१४. संलग्न कागजातहरुः`,
                                    size: 20,
                                    bold: true
                                } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.JUSTIFY,
                            // indent: { 
                            //     // firstLine: 720,
                            //     hanging:360
                            //  },
                            children: [
                                new TextRun( {
                                    text: `क) नागरिकताको प्रतिलिपी/जन्म दर्ता/राहदानी/मतदाता परिचय पत्र/राष्ट्रिय परिचय पत्र/ अन्यको_______________ प्रतिलिपी`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `ख) कैदीपुर्जी`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `ग) ________________________ जिल्ला अदालतको फैसला`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `घ) उच्च/पुनरावेदन अदालत______________________________________________को फैसला`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `ङ) सर्वोच्च अदालतको फैसला`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `च) _________________________________________ को फैसला`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `छ) _________________________________________ को फैसला`, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `ज) मुद्दा अन्तिम भएको जानकारी पत्रः`, size: 20, bold: true
                                } ),
                                new TextRun( {
                                    text: ` ${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ । `, size: 20
                                } ),
                                new TextRun( { break: 1 } ),
                                
                                new TextRun( {
                                    text: `झ) जरिवाना तथा क्षतिपुर्ती दाखिला गरेको पत्र र रसिद ।`, size: 20, bold: true
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `विगतमा मबाट भए गरेको कसूरमा पूर्ण पश्चाताप गर्दै आगामी दिनमा कुनै आपराधिक क्रियाकलापमा संलग्न नहुने र मेरो बाँकी जीवन असल नागरिकका रुपमा बिताउँदै परिवार, समाज र राष्ट्रको हित हुने कार्यमा समर्पित हुने प्रण गर्दछु । म प्यारोलमा रहन मानसिक तथा शारीरिक रुपमा तयार छु । उल्लिखित व्यहोरा ठिक साँचो हो, झुट्ठा ठहरे कानून बमोजिम सहुँला बुझाउँला ।`, size: 20,
                                } ),
                            ],
                        } ),

                        //Insert Table
                        new Table( {
                            width: {
                                size: 100,
                                type: WidthType.PERCENTAGE,
                            },
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                            },
                            rows: [
                                new TableRow( {
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "रोहवर", bold: true } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: "निवेदक", bold: true } )],
                                        } ),
                                    ],
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "नामः" } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `नामः${ data.bandi_name }` } )],
                                        } ),
                                    ]
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "पदः कारागार प्रशासक" } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `दस्तखतः` } )],
                                        } ),
                                    ]
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "दस्तखत" } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `मितिः` } )],
                                        } ),
                                    ]
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: `मितिः` } )],
                                        } ),
                                    ]
                                } ),
                            ]
                        } )

                    ],
                },
            ],
        } );

        const blob = await Packer.toBlob( doc );

        // Trigger browser download
        const url = URL.createObjectURL( blob );
        const a = document.createElement( "a" );
        a.href = url;
        a.download = `${ data.bandi_name }.docx`;
        a.click();
        URL.revokeObjectURL( url );
    };

    return (
        <div>
            <Button onClick={generateDocument} variant="outlined">निवेदन(अनुसूची-१)</Button>
        </div>
    );
}
