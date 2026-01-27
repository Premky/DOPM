// PayroleNoPunrabedanDocx.jsx

import { Button } from "@mui/material";
import NepaliDate from "nepali-datetime";

const current_date = new NepaliDate().format("YYYY-MM-DD");

export default function PayroleNoPunrabedanDocx({ data }) {

    const generateDocument = async () => {
        const {
            Document,
            Packer,
            Paragraph,
            TextRun,
            AlignmentType,
            Table,
            WidthType,
            TableRow,
            TableCell,
        } = await import("docx");

        const { saveAs } = await import("file-saver");

        /* ---------------- Table Header ---------------- */
        const headerRow = new TableRow({
            children: [
                "सि.नं.",
                "मुद्दाको नाम",
                "मुद्दा नं.",
                "जाहेरवाला (वादी)",
                "फैसला गर्ने निकाय",
                "फैसला मिति",
                "कैद परेको मिति",
                "कैद भुक्तान हुने मिति",
                "कैफियत",
            ].map(text =>
                new TableCell({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text, bold: true })],
                        }),
                    ],
                })
            ),
        });

        /* ---------------- Table Rows ---------------- */
        const dataRows = (data?.kaidiMuddas || []).map((item, index) =>
            new TableRow({
                children: [
                    index + 1,
                    item?.mudda_name,
                    item?.mudda_no,
                    item?.vadi,
                    item?.mudda_phesala_antim_office || item?.mudda_office,
                    item?.mudda_phesala_antim_office_date,
                    item?.thuna_date_bs,
                    item?.release_date_bs,
                    "",
                ].map(value =>
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [
                                    new TextRun({ text: String(value ?? "") }),
                                ],
                            }),
                        ],
                    })
                ),
            })
        );

        /* ---------------- Document ---------------- */
        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Kalimati",
                            size: 22,
                        },
                        paragraph: {
                            spacing: { line: 276 },
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
                                width: 11906,
                                height: 16838,
                            },
                            margin: {
                                top: 1440,
                                bottom: 1440,
                                left: 1440,
                                right: 1440,
                            },
                        },
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun("मितिः "),
                                new TextRun(current_date),
                            ],
                        }),

                        new Paragraph({
                            children: [
                                new TextRun("श्रीमान् कारागार प्रशासक/प्यारोल अधिकृतज्यू,"),
                                new TextRun({ break: 1 }),
                                new TextRun({
                                    text: `कारागार कार्यालय ${data?.current_office_name || ""}`,
                                    bold: true,
                                }),
                            ],
                        }),

                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "विषयः पुनरावेदनको काम कारबाही नगरेको सम्बन्धमा ।",
                                    bold: true,
                                }),
                            ],
                        }),

                        new Paragraph({
                            alignment: AlignmentType.JUSTIFIED,
                            children: [
                                new TextRun(
                                    `जिल्ला ${data?.district_name_np || ""} ${
                                        data?.city_name_np || ""
                                    } वडा नं. ${data?.wardno || ""} घर भई हाल कारागार कार्यालय ${
                                        data?.current_office_name || ""
                                    } मा कैद भुक्तान गरिरहेको म निवेदक ${
                                        data?.bandi_name || ""
                                    } को हकमा देहायका मुद्दाहरूमा पुनरावेदनको काम कारबाही अन्तिम भएको व्यहोरा निवेदन गर्दछु ।`
                                ),
                            ],
                        }),

                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [headerRow, ...dataRows],
                        }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(
            blob,
            `${data?.bandi_name || "निवेदक"}_पुनरावेदन_नगरेको_निवेदन.docx`
        );
    };

    return (
        <Button onClick={generateDocument} variant="outlined">
            पुनरावेदन नगरेको निवेदन
        </Button>
    );
}
