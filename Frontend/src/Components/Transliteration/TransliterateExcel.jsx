import { useState } from "react";
import axios from "axios";
import { useBaseURL } from "../../Context/BaseURLProvider";

function TransliterateExcel() {
    const BASE_URL = useBaseURL();
    const [file, setFile] = useState( null );
    const [sheetNames, setSheetNames] = useState( [] );
    const [selectedSheet, setSelectedSheet] = useState( "" );
    const [columns, setColumns] = useState( [] );
    const [selectedColumns, setSelectedColumns] = useState( [] );
    const [filePath, setFilePath] = useState( "" );

    // 1️⃣ Upload file and get sheet names
    const handleFileUpload = async () => {
        const formData = new FormData();
        formData.append( "file", file );
        const res = await axios.post( `${ BASE_URL }/transliterate/get_sheets`, formData );
        setSheetNames( res.data.sheetNames );
        setFilePath( res.data.filePath );
    };

    // 2️⃣ Get columns for selected sheet
    const handleSheetSelect = async ( sheet ) => {
        setSelectedSheet( sheet );
        const res = await axios.post( `${BASE_URL}/transliterate/get_columns`, { filePath, sheetName: sheet } );
        setColumns( res.data.columns );
    };
 
    // 3️⃣ Select columns
    const toggleColumn = ( col ) => {
        setSelectedColumns( ( prev ) =>
            prev.includes( col ) ? prev.filter( ( c ) => c !== col ) : [...prev, col]
        );
    };

    // 4️⃣ Transliterate
    const handleTransliterate = async () => {
        const res = await axios.post(
            `${BASE_URL}/transliterate/transliterate_excel`,
            { filePath, sheetName: selectedSheet, selectedColumns },
            { responseType: "blob" }
        );

        const url = window.URL.createObjectURL( new Blob( [res.data] ) );
        const link = document.createElement( "a" );
        link.href = url;
        link.setAttribute( "download", "Transliterated.xlsx" );
        document.body.appendChild( link );
        link.click();
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Excel Transliteration Tool</h2>
            <h4>यो टुल Excel File को लागि मात्र प्रयोग गर्न सकिन्छ ।</h4>
            <p style={{color:'red'}}> <strong>कृपया ध्यान दिनुहोलाः</strong> </p> 
            <p style={{color:'red'}}>- Transliteration को लागी फाइल Upload गर्नु अगाडी Title मा रहेको Merged Cells लाई Delete गर्नुहोला । </p>
            <p style={{color:'red'}}>- Column Header बाहेको विवरण सबै Delete गरेर मात्र फाइल अपलोड गर्नुहोला । </p>

            <input type="file" onChange={( e ) => setFile( e.target.files[0] )} />
            <button onClick={handleFileUpload}>Upload</button>

            {sheetNames.length > 0 && (
                <div>
                    <h4>Select Sheet:</h4>
                    {sheetNames.map( ( name ) => (
                        <button key={name} onClick={() => handleSheetSelect( name )}>
                            {name}
                        </button>
                    ) )}
                </div>
            )}

            {columns.length > 0 && (
                <div>
                    <h4>Select Columns:</h4>
                    {columns.map( ( col ) => (
                        <label key={col} style={{ display: "block" }}>
                            <input
                                type="checkbox"
                                value={col}
                                onChange={() => toggleColumn( col )}
                                checked={selectedColumns.includes( col )}
                            />
                            {col}
                        </label>
                    ) )}
                    <button onClick={handleTransliterate}>Transliterate & Download</button>
                </div>
            )}
        </div>
    );
}

export default TransliterateExcel;
