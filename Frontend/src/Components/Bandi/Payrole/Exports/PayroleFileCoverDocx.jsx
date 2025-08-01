// MyDocGenerator.js
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    Numbering,
    LevelFormat
} from "docx";
import { Button } from "@mui/material";
import { saveAs } from "file-saver";
import NepaliDate from "nepali-datetime";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";

const current_date = new NepaliDate().format( "YYYY-MM-DD" );

export default function PayroleFileCoverDocx( props ) {
    const { data } = props;

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

    const generateDocument = async () => {
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
                                new TextRun( `${ data.release_date_b } ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैद भुक्तान अवधिः-`, bold: true } ),
                                new TextRun( `${ calculateBSDate( data.thuna_date_bs, current_date ).formattedDuration }  ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `कैद भुक्तान प्रतिशत-`, bold: true } ),
                                new TextRun( `${ calculateBSDate( data.thuna_date_bs, current_date, calculateBSDate( data.thuna_date_bs, data.release_date_bs ) ).percentage }% ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `मुद्दाको अन्तिम फैसला गर्ने निकाय र मितिः-`, bold: true } ),
                                new TextRun( `${data?.muddas[0]?.office_name_with_letter_address}को मिति ${data?.muddas[0]?.mudda_phesala_antim_office_date} ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `पुनरावेदन नपरेको प्रमाणः-`, bold: true } ),
                                new TextRun( `${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `तोकिएको जरिवाना र तिरेको प्रमाण-`, bold: true } ),
                                // new TextRun( `${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),
                        new Paragraph( {
                            numbering: {
                                reference: "my-cool-numbering",
                                level: 0,
                            },
                            children: [
                                new TextRun( { text: `फैसला अनुसार तोकिएको क्षतिपुर्ति तिरेको प्रमाणः-`, bold: true } ),
                                // new TextRun( `${ data.punarabedan_office }को मिति ${ data.punarabedan_office_date }, च.नं. ${ data.punarabedan_office_ch_no }को पत्र संलग्न रहेको छ ।  ` || "" ),
                            ],
                        } ),
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
        saveAs( blob, "payrole_cover.docx" );
    };

    return (
        <div>
            <Button onClick={generateDocument} variant="outlined">
                फाइल कभर (अनुसूची-२)
            </Button>
        </div>
    );
}
