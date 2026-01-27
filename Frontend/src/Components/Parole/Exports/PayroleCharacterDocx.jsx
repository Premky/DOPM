// PayroleCharacterDocx.jsx

import { Button } from "@mui/material";
import NepaliDate from "nepali-datetime";
import { calculateBSDate } from "../../../../Utils/dateCalculator";

const current_date = new NepaliDate().format("YYYY-MM-DD");

export default function PayroleCharacterDocx({ data }) {

    /* ---------------- Address ---------------- */
    const address =
        data?.nationality === "विदेशी"
            ? [
                  data?.bidesh_nagarik_address_details,
                  data?.country_name_np,
              ].filter(Boolean).join(", ")
            : [
                  data?.city_name_np,
                  data?.district_name_np,
                  data?.state_name_np,
                  data?.country_name_np,
              ].filter(Boolean).join(", ");

    const generateDocument = async () => {
        const { saveAs } = await import("file-saver");
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

        /* ---------------- Duration Calculation ---------------- */
        const hasDates = data?.thuna_date_bs && data?.release_date_bs;
        const empty = { formattedDuration: "", percentage: "" };

        let kaidDuration = hasDates
            ? calculateBSDate(data.thuna_date_bs, data.release_date_bs)
            : empty;

        let bhuktanDuration = hasDates
            ? calculateBSDate(data.thuna_date_bs, current_date, kaidDuration)
            : empty;

        const hirasatYears = data?.hirasat_years || 0;
        const hirasatMonths = data?.hirasat_months || 0;
        const hirasatDays = data?.hirasat_days || 0;

        if (hirasatYears || hirasatMonths || hirasatDays) {
            kaidDuration = calculateBSDate(
                data.thuna_date_bs,
                data.release_date_bs,
                0,
                hirasatYears,
                hirasatMonths,
                hirasatDays
            );

            bhuktanDuration = calculateBSDate(
                data.thuna_date_bs,
                current_date,
                kaidDuration,
                hirasatYears,
                hirasatMonths,
                hirasatDays
            );
        }

        /* ---------------- Table Header ---------------- */
        const headerRow = new TableRow({
            children: [
                "सि.नं.",
                "कैदीको नाम थर ठेगाना",
                "उमेर",
                "गरेको कसूर",
                "भएको सजाय",
                "कैद भुक्तान गरेको अवधि",
                "अनुचित काम गरे/नगरेको",
                "अनुचित कामको विवरण",
                "कारागार प्रमुखको राय",
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
                    `${data?.bandi_name || ""}\n${address}`,
                    `${data?.current_age || ""} वर्ष`,
                    item?.mudda_name || "",
                    kaidDuration.formattedDuration || "",
                    `${bhuktanDuration.formattedDuration || ""} (${bhuktanDuration.percentage || ""}%)`,
                    "नगरेको",
                    "नगरेको",
                    "निजको चालचलन असल रहेको, कारागारमा रहँदा कुनै अनुचित कार्य नगरेको तथा तोकिएको कैदको दुई तिहाई अवधि भुक्तान गरेको हुनाले प्यारोलमा राख्न सिफारिस गरिएको ।",
                ].map(value =>
                    new TableCell({
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                children: [new TextRun(String(value))],
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
                                orientation: "landscape",
                                width: 16838, // landscape width
                                height: 11906, // landscape height
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
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: "अनुसूची १", size: 24 }),
                                new TextRun({ break: 1 }),
                                new TextRun({
                                    text: "(नियम ३ को उपनियम (१) सँग सम्बन्धित)",
                                    size: 24,
                                }),
                                new TextRun({ break: 1 }),
                                new TextRun({
                                    text: "कैदीको चालचलन सम्बन्धी अभिलेख",
                                    bold: true,
                                    size: 26,
                                }),
                                new TextRun({ break: 1 }),
                                new TextRun({
                                    text: `कारागार कार्यालय ${data?.current_office_name || ""}`,
                                    bold: true,
                                    size: 30,
                                }),
                            ],
                        }),

                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [headerRow, ...dataRows],
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "चालचलन प्रमाणित गर्ने कारागार प्रमुखः",
                                    bold: true,
                                }),
                            ],
                        }),
                        new Paragraph({ children: [new TextRun("नाम थरः")] }),
                        new Paragraph({ children: [new TextRun("दस्तखतः")] }),
                        new Paragraph({ children: [new TextRun("पदः")] }),
                        new Paragraph({
                            children: [
                                new TextRun(`मितिः ${current_date}`),
                            ],
                        }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${data?.bandi_name || "कैदी"}_चालचलन.docx`);
    };

    return (
        <Button onClick={generateDocument} variant="outlined">
            चालचलन
        </Button>
    );
}
