import { Button } from "@mui/material";
import NepaliDate from "nepali-datetime";
import { calculateBSDate } from "../../../../Utils/dateCalculator";

const current_date = new NepaliDate().format("YYYY-MM-DD");

export default function PayroleFileCoverDocx({ data }) {
// console.log(data)
    const mainMudda = data?.kaidiMuddas?.[0] || {};
    const punarabedan = data?.bandiNoPunarabedan?.[0];

    const hasDates = Boolean(data?.thuna_date_bs && data?.release_date_bs);
    const emptyDuration = { formattedDuration: "", percentage: 0 };

    const kaidDuration = hasDates
        ? calculateBSDate(data.thuna_date_bs, data.release_date_bs)
        : emptyDuration;

    const bhuktanDuration = hasDates
        ? calculateBSDate(data.thuna_date_bs, current_date, kaidDuration)
        : emptyDuration;

    const bakiDuration = hasDates
        ? calculateBSDate(current_date, data.release_date_bs, kaidDuration)
        : emptyDuration;

    const hirasatDays = mainMudda?.hirasat_days || 0;
    const hirasatMonths = mainMudda?.hirasat_months || 0;
    const hirasatYears = mainMudda?.hirasat_years || 0;

    let totalKaidDuration = kaidDuration;
    let totalBhuktanDuration = bhuktanDuration;
    let totalBakiDuration = bakiDuration;

    if (hirasatDays || hirasatMonths || hirasatYears) {
        totalKaidDuration = hasDates
            ? calculateBSDate(
                  data.thuna_date_bs,
                  data.release_date_bs,
                  0,
                  hirasatYears,
                  hirasatMonths,
                  hirasatDays
              )
            : emptyDuration;

        totalBhuktanDuration = hasDates
            ? calculateBSDate(
                  data.thuna_date_bs,
                  current_date,
                  totalKaidDuration,
                  hirasatYears,
                  hirasatMonths,
                  hirasatDays
              )
            : emptyDuration;

        totalBakiDuration = hasDates
            ? calculateBSDate(current_date, data.release_date_bs, totalKaidDuration)
            : emptyDuration;
    }

    // Address
    let address = "";
    if (data?.nationality === "विदेशी") {
        address = `${data?.bidesh_nagarik_address_details || ""}, ${data?.country_name_np || ""}`;
    } else if (data?.nationality === "स्वदेशी") {
        address = `${data?.city_name_np || ""}, ${data?.district_name_np || ""}, ${data?.state_name_np || ""}, ${data?.country_name_np || ""}`;
    }

    // Mudda name
    const mudda_name =
        data?.kaidiMuddas?.length > 0
            ? data.kaidiMuddas.map(m => m.mudda_name).join(", ")
            : data?.mudda_name || "";

    const generateDocument = async () => {
        const {
            Document,
            Packer,
            Paragraph,
            TextRun,
            AlignmentType,
            LevelFormat,
        } = await import("docx");
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
                            style: { paragraph: { indent: { left: 800, hanging: 400 } } },
                        },
                        {
                            level: 1,
                            format: LevelFormat.DECIMAL,
                            text: "%1.%2.",
                            alignment: AlignmentType.LEFT,
                            style: { paragraph: { indent: { left: 1200, hanging: 400 } } },
                        },
                    ],
                },
            ],
        };

        const doc = new Document({
            numbering,
            styles: {
                default: {
                    document: {
                        run: { font: "Kalimati", size: 22 },
                        paragraph: { spacing: { line: 276 } },
                    },
                },
            },
            sections: [
                {
                    properties: {
                        page: {
                            size: { width: 11906, height: 16838 },
                            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
                        },
                    },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `कारागार कार्यालय ${data?.current_office_name || ""}`,
                                    bold: true,
                                    size: 26,
                                }),
                                new TextRun({ break: 1 }),
                                new TextRun({ text: "अनुसूची २", bold: true }),
                                new TextRun({ break: 1 }),
                                new TextRun(
                                    "प्यारोलमा राख्न सिफारिस गर्ने कैदीको रेकर्ड फाइलको बाहिर पट्टी उल्लेख गर्नुपर्ने विवरण"
                                ),
                            ],
                        }),

                        info("कैदीबन्दीको नाम थरः-", data?.bandi_name),
                        info("ठेगानाः-", address),
                        info("मुद्दाको नामः-", mudda_name),
                        info("जाहेरवालाको नाम-", mainMudda?.vadi),
                        info("कैद परेको मितिः-", data?.thuna_date_bs),
                        info("तोकिएको कैदः-", totalKaidDuration.formattedDuration),
                        info("कैद भुक्तान हुने मितिः-", data?.release_date_bs),
                        info("कैद भुक्तान अवधिः-", totalKaidDuration.formattedDuration),
                        info(
                            "कैद भुक्तान अवधि/प्रतिशत-",
                            `${totalBhuktanDuration.formattedDuration} (${totalBhuktanDuration.percentage}%)`
                        ),
                        info(
                            "मुद्दाको अन्तिम फैसला गर्ने निकाय र मितिः-",
                            `${mainMudda?.mudda_phesala_antim_office || ""} को मिति ${mainMudda?.mudda_phesala_antim_office_date || ""}`
                        ),
                        info(
                            "पुनरावेदन नपरेको प्रमाणः-",
                            punarabedan
                                ? `${punarabedan.punarabedan_office} को च.नं. ${punarabedan.punarabedan_office_ch_no}, मिति ${punarabedan.punarabedan_office_date} गतेको पत्र संलग्न रहेको छ ।`
                                : "पुनरावेदन नपरेको प्रमाण संलग्न रहेको छ ।"
                        ),
                    ],
                },
            ],
        });

        function info(label, value = "") {
            return new Paragraph({
                numbering: { reference: "my-cool-numbering", level: 0 },
                children: [
                    new TextRun({ text: label, bold: true }),
                    new TextRun(value || ""),
                ],
            });
        }

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${data?.bandi_name || "file"} को फाइल कभर.docx`);
    };

    return (
        <Button variant="outlined" onClick={generateDocument}>
            फाइल कभर (अनुसूची-२)
        </Button>
    );
}
