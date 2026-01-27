// MyDocGenerator.js
// import {
//     Document,
//     Packer,
//     Paragraph,
//     TextRun,
//     AlignmentType,
//     Numbering,
//     LevelFormat
// } from "docx";
import { Button } from "@mui/material";
// import { saveAs } from "file-saver";
import NepaliDate from "nepali-datetime";
import { calculateBSDate, calculateDateDetails } from '../../../../Utils/dateCalculator';

const current_date = new NepaliDate().format( "YYYY-MM-DD" );

export default function PayroleFileCoverDocx( props ) {
    const { data } = props;
    
    // console.log(data)
    const kaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs );
    const bhuktanDuration = calculateBSDate( data.thuna_date_bs, current_date, kaidDuration );
    const bakiDuration = calculateBSDate( current_date, data.release_date_bs, kaidDuration );

    const hirasatDays = data?.hirasat_days || 0;
    const hirasatMonths = data?.hirasat_months || 0;
    const hirasatYears = data?.hirasat_years || 0;
    let totalKaidDuration = kaidDuration;
    let totalBhuktanDuration = bhuktanDuration;
    let totalBakiDuration = bakiDuration;
    if ( hirasatDays > 0 || hirasatMonths > 0 || hirasatYears > 0 ) {
        totalKaidDuration = calculateBSDate( data.thuna_date_bs, data.release_date_bs, 0, hirasatYears, hirasatMonths, hirasatDays );
        totalBhuktanDuration = calculateBSDate( data.thuna_date_bs, current_date, totalKaidDuration, hirasatYears, hirasatMonths, hirasatDays );
        totalBakiDuration = calculateBSDate( current_date, data.release_date_bs, totalKaidDuration );
    }

    // Handle address
    let address = "";
    if ( data?.nationality === "विदेशी" ) {
        address = `${ data?.bidesh_nagarik_address_details || "" }, ${ data?.country_name_np || "" }`;
    } else if ( data?.nationality === "स्वदेशी" ) {
        address = `${ data?.city_name_np || "" }, ${ data?.district_name_np || "" }, ${ data?.state_name_np || "" }, ${ data?.country_name_np || "" }`;
    }

    // Handle mudda names
    let mudda_name = "";
    if ( Array.isArray( data?.muddas ) ) {
        mudda_name = data.muddas.map( ( m ) => m.mudda_name ).join( ", " );
    }
    console.log( data );
    const generateDocument = async () => {
        const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, WidthType, TableRow, TableCell, LevelFormat } = await import('docx');
        const { saveAs } = await import("file-saver");
        const numbering = {
            config: [
                {
                    reference: "my-cool-numbering",
                    levels: [
                        {
                            level: 0,
                            format: LevelFormat.DECIMAL,
                            text: "%1.",
                            alignment: AlignmentType.LEFT,
                            style: {
                                paragraph: {
                                    indent: { left: 800, hanging: 400 }, // 0.5 inch indent
                                },
                            },
                        },
                    ],
                },
            ],
        };

        const doc = new Document( {
            numbering,
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Kalimati",
                            size: 22, // 11pt = 22 half-points
                        },
                        paragraph: {
                            spacing: {
                                line: 276, // line spacing 1.15
                            },
                        },
                    },
                },
            },
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: "portrait",
                                width: 11906, // A4 width in twips
                                height: 16838, // A4 height in twips
                            },
                            margin: {
                                top: 1440, // 1 inch
                                bottom: 1440,
                                left: 1440,
                                right: 1440,
                            },
                        },
                    },
                    children: [
                        new Paragraph( {
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun( { text: `कारागार कार्यालय ${ data?.letter_address || "" }`, bold: true, size: 26 } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "अनुसूची २", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun(
                                    "प्यारोलमा राख्न सिफारिस गर्ने कैदीको रेकर्ड फाइलको बाहिर पट्टी उल्लेख गर्नुपर्ने विवरण"
                                ),
                            ],
                        } ),

                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैदीबन्दीको नाम थरः-`, bold: true } ),
                                new TextRun( `${ data?.bandi_name || "" }` ),
                            ],
                        } ),

                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `ठेगानाः-`, bold: true } ),
                                new TextRun( `${ address }` || "" ),
                            ],
                        } ),

                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `मुद्दाको नामः-`, bold: true } ),
                                new TextRun( `${ mudda_name }` || "" ),
                            ],
                        } ),

                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `जाहेरवालाको नाम-`, bold: true } ),
                                new TextRun( `${ data.muddas[0].vadi }` || "" ),
                            ],
                        } ),

                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैद परेको मितिः-`, bold: true } ),
                                new TextRun( `${ data?.thuna_date_bs }` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `तोकिएको कैदः-`, bold: true } ),
                                new TextRun( `${ calculateBSDate( data.thuna_date_bs, data.release_date_bs ).formattedDuration }` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैद भुक्तान हुने मितिः-`, bold: true } ),
                                new TextRun( `${ data.release_date_bs } ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैद भुक्तान अवधिः-`, bold: true } ),
                                new TextRun( `${ totalKaidDuration.formattedDuration }` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैद भुक्तान अवधि/प्रतिशत-`, bold: true } ),
                                new TextRun( `${ totalBhuktanDuration.formattedDuration } (${ totalBhuktanDuration.percentage }%) ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `मुद्दाको अन्तिम फैसला गर्ने निकाय र मितिः-`, bold: true } ),
                                new TextRun( `${ data?.muddas[0]?.mudda_phesala_antim_office }को मिति ${ data?.muddas[0]?.mudda_phesala_antim_office_date } ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `पुनरावेदन नपरेको प्रमाणः-`, bold: true } ),
                                new TextRun( `${ data.punarabedan_office_name }को च.नं. ${ data.punarabedan_office_ch_no }, मिति ${ data.punarabedan_office_date } गतेको पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),

                        new Paragraph( {
                            numbering: { reference: "my-cool-numbering", level: 0 },
                            children: [
                                new TextRun( { text: `तोकिएको जरिवाना/बिगो/क्षतिपुर्ती र तिरेको प्रमाण-`, bold: true } )
                            ],
                        } ),

                        ...( data?.bandiFines?.length > 0
                            ? data.bandiFines.map(
                                ( fine, index ) =>
                                    new Paragraph( {
                                        numbering: { reference: "my-cool-numbering", level: 1 },
                                        indent: { left: 720 },
                                        children: [
                                            new TextRun( {
                                                text: `${ index + 1 }. ${ fine.deposit_office }को च.नं. ${ fine.deposit_ch_no }, मिति ${ fine.deposit_date } गतेको पत्रबाट रु. ${ fine.deposit_amount } ${ fine.fine_name_np } ${ fine.amount_deposited === 1 ? 'बुझाएको' : 'नबुझाएको' } ।`,
                                            } ),                                            
                                        ],
                                    } ),
                            )
                            : [new TextRun( "कुनै जरिवाना/क्षतिपुर्ती/बिगो तोकिएको छैन।" )] ),

                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `फैसला अनुसार तोकिएको बिगो तिरेको प्रमाणः-`, bold: true } ),
                                // new TextRun( `${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `फैसला अनुसार तोकिएको राहत कोष तिरेको प्रमाणः-`, bold: true } ),
                                // new TextRun( `${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `अन्यः-`, bold: true } ),
                                // new TextRun( `${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),
                    ],
                },
            ],
        } );

        const blob = await Packer.toBlob( doc );
        saveAs( blob, `${ data.bandi_name } को फाइल कभर.docx` );
    };

    return (
        <div>
            <Button onClick={generateDocument} variant="outlined">
                फाइल कभर (अनुसूची-२)
            </Button>
        </div>
    );
}
