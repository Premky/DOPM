// MyDocGenerator.js
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, WidthType, TableRow, TableCell, BorderStyle } from "docx";
import { Button } from "@mui/material";
import NepaliDate from 'nepali-datetime';
const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
export default function TransferCommonLetterDocx( props ) {
    const { data } = props;
    console.log( data );
    let address;
    if ( data?.nationality == 'विदेशी' ) {
        address = `${ data?.bidesh_nagarik_address_details },${ data?.country_name_np }`;
    } else if ( data?.nationality == 'स्वदेशी' ) {
        address = `${ data.city_name_np, data.district_name_np, data.district_name_np, data.state_name_np, data.country_name_np }`;
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
                                new TextRun( { text: "नेपाल सरकार", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "गृह मन्त्रालय", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "कारागार व्यवस्थापन विभाग", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "कालिकास्थान, काठमाण्डौं", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "(बन्दी प्रशासन शाखा)", bold: true } ),
                            ],
                        } ),
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
                                            children: [new Paragraph( { text: "पत्र सङ्ख्याः", bold: true } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `मितिः${ current_date }`, bold: true } )],
                                        } ),
                                    ],
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "चलानी नं." } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `ने.सं.` } )],
                                        } ),
                                    ]
                                } ),
                            ]
                        } ),

                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: "श्री कारागार कार्यालय," } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: `${ data.letter_address } ।` } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun( { text: "विषय:- स्थानान्तरण सम्बन्धमा ।", bold: true } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.JUSTIFIED,
                            children: [
                                new TextRun( {
                                    text: `
                                    उपर्युक्त सम्बन्धमा तहाँ कार्यालयको च.नं. _____ मिति _________ को कैदीबन्दी स्थानान्तरण विषयको पत्र र सो साथ संलग्न कागजातहरु प्राप्त भयो । सो सम्बन्धमा देहायमा उल्लेखित निम्न मुद्दाका निम्न कैदीबन्दीहरुलाई निजको मुद्दासँग सम्बद्ध सबै कागजात र चालचलन सम्बन्धी विवरण सहित आवश्यक सुरक्षाका साथ श्री कारागार कार्यालय ${ data.letter_address } स्थानान्तरण गर्नु गराउनुहुन साथै उक्त बन्दी बुझाउन आएमा कारागार कार्यालय, ${ data.letter_address }ले बुझिलिनुहुन समेत यस विभागको मिति ............ को निर्णयानुसार अनुरोध छ । साथै कैदीबन्दी स्थानान्तरण गरी लैजादा जुन कारागारमा बन्दी लैजाने हो सो कारागारका कारागार प्रशासकसँग समन्वय गरेर मात्र स्थानान्तरण गर्नुहुन सूचित गरिन्छ ।`,
                                    size: 20
                                } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: "देहाय", bold: true, underline: true } ),
                            ],
                        } ),

                        //Insert Table
                        new Table( {
                            width: {
                                size: 100,
                                type: WidthType.PERCENTAGE,
                            },
                            rows: [
                                // Header row
                                new TableRow( {
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TableCell( { children: [new Paragraph( { text: "सि.नं.", bold: true } )] } ),
                                        new TableCell( { children: [new Paragraph( { text: "नाम, थर र ठेगाना", bold: true } )] } ),
                                        new TableCell( { children: [new Paragraph( { text: "मुद्दा", bold: true } )] } ),
                                        new TableCell( { children: [new Paragraph( { text: "कैदी/थुनुवा", bold: true } )] } ),
                                        new TableCell( { children: [new Paragraph( { text: "कैफियत", bold: true } )] } ),
                                    ],
                                } ),
                                // Data rows
                                ...data.map( ( d, i ) =>
                                    new TableRow( {
                                        alignment: AlignmentType.CENTER,
                                        children: [
                                            new TableCell( { children: [new Paragraph( { text: `${ i + 1 }` } )] } ),
                                            new TableCell( { children: [new Paragraph( { text: d.bandi_name || "" } )] } ),
                                            new TableCell( { children: [new Paragraph( { text: d?.muddas?.[0]?.mudda_name || "" } )] } ),
                                            new TableCell( { children: [new Paragraph( { text: d.bandi_type || "" } )] } ),
                                            new TableCell( { children: [new Paragraph( { text: d.remarks || "" } )] } ),
                                        ],
                                    } )
                                )
                            ]
                        } ),                        

                        new Paragraph({ text: "", spacing: { after: 300 } }),

                        
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
                                            children: [new Paragraph( { text: "बोधार्थः", bold: true, underline: true } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: ".................", bold: true } )],
                                        } ),
                                    ],
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "श्री" } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `__` } )],
                                        } ),
                                    ]
                                } ),
                                new TableRow( {
                                    children: [
                                        new TableCell( {
                                            children: [new Paragraph( { text: "श्री" } )],
                                        } ),
                                        new TableCell( {
                                            children: [new Paragraph( { text: `शाखा अधिकृत` } )],
                                        } ),
                                    ]
                                } ),
                            ]
                        } ),
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
            <Button onClick={generateDocument} variant="outlined">सरुवा पत्र</Button>
        </div>
    );
}
