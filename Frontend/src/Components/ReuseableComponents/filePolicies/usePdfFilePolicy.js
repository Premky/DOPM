import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const usePdfFilePolicy = ( {
    numCases = 1,
    sizePerPageMB = 0.5,
    rejectEncrypted = true,
    rejectScanned = false,
} ) => {

    const validatePdf = async ( file ) => {
        if ( file.type !== "application/pdf" ) {
            throw new Error( "कृपया PDF फाइल मात्र अपलोड गर्नुहोस्" );
        }

        const buffer = await file.arrayBuffer();

        let pdf;
        try {
            pdf = await pdfjsLib.getDocument( { data: buffer } ).promise;
        } catch ( err ) {
            if ( rejectEncrypted && err?.name === "PasswordException" ) {
                throw new Error( "पासवर्ड सुरक्षित PDF स्वीकार्य छैन" );
            }
            throw new Error( "PDF पढ्न सकिएन" );
        }

        const pages = pdf.numPages;
        const maxAllowedSize = numCases * pages * sizePerPageMB * 1024 * 1024;

        if ( file.size > maxAllowedSize ) {
            throw new Error(
                `PDF ${ pages } पृष्ठको छ। अधिकतम अनुमति ${ ( maxAllowedSize / 1024 / 1024 ).toFixed( 2 ) } MB हो`
            );
        }

        if ( rejectScanned ) {
            let textCount = 0;
            const pagesToCheck = Math.min( pages, 2 );

            for ( let i = 1; i <= pagesToCheck; i++ ) {
                const page = await pdf.getPage( i );
                const text = await page.getTextContent();
                textCount += text.items.length;
            }

            if ( textCount === 0 ) {
                throw new Error( "स्क्यान गरिएको (image-only) PDF स्वीकार्य छैन" );
            }
        }

        return { pages };
    };

    return { validatePdf };
};
