// MyDocGenerator.js
// import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, WidthType, TableRow, TableCell, LevelFormat } from "docx";
import { Button } from "@mui/material";
import NepaliDate from "nepali-datetime";
import { calculateBSDate } from '../../../../Utils/dateCalculator';

const current_date = new NepaliDate().format( "YYYY-MM-DD" );

export default function PayroleCharacterDocx( props ) {
    
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
        const { saveAs } = await import("file-saver");
        const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, WidthType, TableRow, TableCell, LevelFormat } = await import("docx");
        const headerRow = new TableRow( {
            children: [
                "सि.नं.",
                "कैदीको नाम थर ठेगाना",
                "कैदीको उमेर",
                "गरेको कसूर",
                "भएको सजाय",
                "कैद भुक्तान गरेको अवधि",
                "कैदमा कुनै किसिमको अनुचित काम गरे/नगरेको",
                "अनुचित काम गरेको भए त्यसको विवरण",
                "कारागार प्रमुखको राय",
            ].map(
                ( headerText ) => new TableCell( {
                    children: [
                        new Paragraph( {
                            children: [new TextRun( { text: headerText, bold: true } )],
                            alignment: AlignmentType.CENTER,
                        } ),
                    ],
                } ),
            ),
        } );
        // console.log( data );
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

        
        const dataRows = data.muddas.map( ( item, index ) => {
            return new TableRow( {
                children: [
                    index + 1,
                    `${ data?.bandi_name }\n  ${ address }`,
                    `${ data?.current_age } वर्ष`,
                    item?.mudda_name,
                    totalKaidDuration.formattedDuration,
                    `${ totalBhuktanDuration.formattedDuration }\n (${ totalBhuktanDuration.percentage })%`,
                    'नगरेको',
                    '',
                    ''
                ].map(
                    ( text ) =>
                        new TableCell( {
                            children: [
                                new Paragraph( {
                                    children: [new TextRun( { text: String( text ) } )],
                                } ),
                            ],
                        } )
                ),
            } );
        } );


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
                                orientation: "landscape",
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
                                new TextRun( { text: "अनुसूची १", size: 24 } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "(नियम ३ को उपनियम (१) सँग सम्बन्धित)", size: 24 } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "कैदीको चालचलन सम्बन्धि अभिलेख", bold: true, size: 24 } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: `कारागार कार्यालय ${ data?.letter_address }`, bold: true, size: 32 } ),
                            ],
                        } ),


                        //For Table:
                        new Table( {
                            width: {
                                size: 100,
                                type: WidthType.PERCENTAGE,
                            },
                            rows: [headerRow, ...dataRows],
                        } ),

                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: `चालचलन प्रमाणित गर्ने कारागारको प्रमुखकोः-`, bold: true, size: 24 } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: `नाम थरः` } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: `दस्थखतः` } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: `पदः` } ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.LEFT,
                            children: [
                                new TextRun( { text: `मितिः` } ),
                            ],
                        } ),
                    ],
                },
            ],
        } );

        const blob = await Packer.toBlob( doc );
        saveAs( blob, `${ data.bandi_name }को_चालचलन.docx` );
    };

    return (
        <div>
            <Button onClick={generateDocument} variant="outlined">
                चालचलन
            </Button>
        </div>
    );
}
