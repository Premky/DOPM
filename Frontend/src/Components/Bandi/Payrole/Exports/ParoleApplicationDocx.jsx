// MyDocGenerator.js
import React from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { Button } from "@mui/material";
import { calculateBSDate } from "../../../../../Utils/dateCalculator";
import NepaliDate from 'nepali-datetime';
const current_date = new NepaliDate().format( 'YYYY-MM-DD' );
export default function ParoleApplicationDocx( props ) {
    const { data } = props;
    console.log( data );
    let address
    if(data?.nationality=='विदेशी'){
        address = `${data?.bidesh_nagarik_address_details},${data?.country_name_np}`
    }else if(data?.nationality=='स्वदेशी'){
        address = `data.city_name_np, data.district_name_np, data.district_name_np, data.state_name_np, data.country_name_np;`
    }
    let mudda_name;
    if(data?.muddas){
        const muddas = data.muddas;
        muddas.map((m, i)=>{
            if(mudda_name){
                mudda_name += ','+m.mudda_name
            }else{
                mudda_name=m.mudda_name
            }            
        })
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
                    }
                }
            },
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph( {
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun( { text: "अनुसूची २", bold: true } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( { text: "(दफा १२ को उपदफा (१) सँग सम्बन्धित)", bold: true } ),
                            ],
                        } ),
                        new Paragraph( {
                            children: [
                                new TextRun( { text: "श्री संघीय प्रोवेशन तथा प्यारोल बोर्ड,", bold: true } ),
                                new TextRun( { text: "काठमाडौं ।", bold: true } ),
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
                                    text: `म निवेदक देहाय बमोजिमको विवरण तथा संलग्न कागजात सहित प्यारोलमा कन्काई नगरपालिका  ४,
                                    झापा बस्न पाउँनका लागि श्री ………… जिल्ला अदालत समक्ष सिफारिस गरि पाउन सादर अनुरोध गर्दछु ।`,
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
                                    text: `${ data.bandi_name }, ${address}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `२. मुद्दाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${mudda_name}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `३. वादीको नामर, थर ठेगानाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${data.muddas[0].vadi}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `४. प्रतिवादीहरुको नाम, थर र ठेगानाः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${data.muddas[0].vadi}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `५. मुद्दा फैसला गर्ने अदालतः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${data.muddas[0].office_name_with_letter_address}, ${data.muddas[0].mudda_phesala_antim_office_date}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `६. कसूर ठहर भई तोकिएको सजायः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${calculateBSDate( data.thuna_date_bs, data.release_date_bs ).formattedDuration}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `७. वादी नेपाल सरकारको पुनरावेदन कारवाही सम्बन्धी विवरणः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${data.punarabedan_office} को मिति ${data.punarabedan_office_date} गतेको च.नं. ${data.punarabedan_office_ch_no}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `८. प्रतिवादीहरुको पुनरावेदन कारवाही सम्बन्धी विवरणः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: ``,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                                new TextRun( {
                                    text: `९. हालसम्म भुक्तान गरेको सजायः-`,
                                    size: 20,
                                    bold: true
                                } ),
                                new TextRun( {
                                    text: `${calculateBSDate( data.thuna_date_bs, current_date ).formattedDuration}`,
                                    size: 20,
                                } ),
                                new TextRun( { break: 1 } ),
                            ],
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
        a.download = "My_Document.docx";
        a.click();
        URL.revokeObjectURL( url );
    };

    return (
        <div>
            <Button onClick={generateDocument}>निवेदन(अनुसूची-२)</Button>
        </div>
    );
}
