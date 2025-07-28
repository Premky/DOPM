// MyDocGenerator.js
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, WidthType, TableRow, TableCell, BorderStyle, LevelFormat  } from "docx";
import { Button } from "@mui/material";
import { saveAs } from "file-saver";
import NepaliDate from "nepali-datetime";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";

const current_date = new NepaliDate().format( "YYYY-MM-DD" );

export default function PayroleNoPunrabedanDocx( props ) {
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
        const headerRow = new TableRow({
                          children:[
                            "सि.नं.",
                            "कैदीको नामथर",
                            "कैदीको जन्म मिति(उमेर)",
                            "गरेको कसूर",
                            "भएको सजाय",
                            "कैद भुक्तान गरेको अवधि",
                            "कैदमा कुनै किसिमको अनुचित काम गरे/नगरेको",
                            "अनुचित काम गरेको भए त्यसको कारण",
                            "कारागार प्रमुखको राय",
                          ].map(
                            (headerText)=>new TableCell({
                                children:[
                                    new Paragraph({
                                        children:[new TextRun({text:headerText, bold:true})],
                                        alignment: AlignmentType.CENTER,
                                    }),
                                ],
                            }),
                          ),
                        });
                        const dataRows = data.muddas.map((item, index)=>{
                            return new TableRow({
                                children:[
                                    index+1, 
                                    `${data?.bandi_name}\n${address}`,
                                    data?.dob,
                                    item?.mudda_name, 
                                    item?.kaid_duration,
                                    `${ calculateBSDate( data.thuna_date_bs, current_date ).formattedDuration } (${ calculateBSDate( data.thuna_date_bs, current_date, calculateBSDate( data.thuna_date_bs, data.release_date_bs ) ).percentage }%)`,
                                    data?.thuna_date_bs,
                                    data?.release_date_bs,
                                    item?.remarks,
                                ].map(
                                    (text)=>
                                        new TableCell({
                                            children:[
                                                new Paragraph({
                                                    children:[new TextRun({text:String(text)})],
                                                }),
                                            ],
                                        })
                                ),
                            });
                        });
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
                            children: [
                                new TextRun( { text: "मितिः"} ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: `श्रीमान् कारागार प्रशासकज्यू,` } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: `कारागार कार्यालय ${ data?.letter_address || "" }`, bold: true } ),                                
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.CENTER,
                            children: [                                
                                new TextRun(
                                    {text:"विषयः पुनरावेदनको काम कारबाही नगरेको सम्बन्धमा ।", bold:true}
                                ),
                            ],
                        } ),
                        new Paragraph( {
                            alignment: AlignmentType.JUSTIFIED,
                            children: [                                
                                new TextRun(
                                    {text:`उर्युक्त सम्बन्धमा जिल्ला ${ data?.district_name_np || "" } ${ data?.city_name_np || "" } वडा नं. ${data?.wardno} घर भई हाल कारागार कार्यालय ${data?.letter_address}मा कैद भुक्तान गरीरहेको म निवेदक ${data?.bandi_name} को हकमा फैसला भऐका देहायका मुद्दाहरुमा म निवेदकको तर्फबाट पुनरावेदनको काम कारवाही अन्तिम भएको व्यहोरा निवेदन गर्दछु । उक्त व्यहोरा साँचो हो, झुट्ठा ठहरेमा कानून बमोजिम सहुँला बुझाउँला ।`}
                                ),
                            ],
                        } ),                                            

                        //For Table:
                        new Table({
                            width:{
                                size:100,
                                type:WidthType.PERCENTAGE,
                            },
                            rows:[headerRow, ...dataRows],
                        })
                    ],
                },
            ],
        } );

        const blob = await Packer.toBlob( doc );
        saveAs( blob, `${data.bandi_name}को_पुनरावेदन नगरेको निवेदन.docx` );
    };

    return (
        <div>
            <Button onClick={generateDocument} variant="outlined">
                पुनरावेदन नगरेको निवेदन
            </Button>
        </div>
    );
}
