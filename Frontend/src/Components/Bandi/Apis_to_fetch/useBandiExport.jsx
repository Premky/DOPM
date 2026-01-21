import { useState, useRef } from "react";
import axios from "axios";

const useBandiExport = (BASE_URL, authState, filters, includePhoto, language) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      cancelRef.current = false;

      const response = await axios.get(`${BASE_URL}/bandi/export_office_bandi_excel`, {
        params: { ...filters, includePhoto: includePhoto ? 1 : 0, language },
        responseType: "blob",
        withCredentials: true,
        onDownloadProgress: (event) => {
          if (event.total) {
            setProgress(Math.floor((event.loaded / event.total) * 100));
          }
        },
      });

      if (cancelRef.current) return; // stop if cancelled

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileNameEn = `Bandi_Details_for_${authState.office_en}${includePhoto ? "_With_Photo.xlsx" : ".xlsx"}`;
      const fileNameNp = `${authState.office_np}${includePhoto ? "_को_लागी_फोटो_सहितको_बन्दीहरुको_विवरण.xlsx" : "_को_बन्दीहरुको_विवरण.xlsx"}`;

      link.download = language === "en" ? fileNameEn : fileNameNp;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const cancelExport = () => {
    cancelRef.current = true;
    setExporting(false);
    setProgress(0);
  };

  return { handleExport, cancelExport, exporting, progress };
};

export default useBandiExport;
