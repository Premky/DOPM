import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const useBandiExport = (BASE_URL, authState, filters, includePhoto, language) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    try {
      setExporting(true);
      setProgress(0);

      // 1️⃣ Start job
      const params = { ...filters, includePhoto: includePhoto ? 1 : 0, language };
      const { data } = await axios.post(
        `${BASE_URL}/bandi/export_office_bandi_excel`,
        null,
        { params, withCredentials: true }
      );

      const jobId = data.jobId;

      // 2️⃣ Poll job status every 2s
      const poll = setInterval(async () => {
        const statusRes = await axios.get(`${BASE_URL}/bandi/export_status/${jobId}`);
        const { status, progress: jobProgress, result } = statusRes.data;

        setProgress(jobProgress);

        if (status === "completed" && result?.filePath) {
          clearInterval(poll);

          // 3️⃣ Download file
          const downloadRes = await axios.get(
            `${BASE_URL}/bandi/export_download/${result.filePath.split("/").pop()}`,
            { responseType: "blob", withCredentials: true }
          );

          const blob = new Blob([downloadRes.data]);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;

          const fileNameEn = `Bandi_Details_for_${authState.office_en}${includePhoto ? '_With_Photo.xlsx' : '.xlsx'}`;
          const fileNameNp = `${authState.office_np}${includePhoto ? '_को_लागी_फोटो_सहितको_बन्दीहरुको_विवरण.xlsx' : '_को_बन्दीहरुको_विवरण.xlsx'}`;

          link.download = language === "en" ? fileNameEn : fileNameNp;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          Swal.fire("Success", "Export completed!", "success");
          setExporting(false);
          setProgress(100);
        }

        if (status === "failed") {
          clearInterval(poll);
          Swal.fire("Error", "Export failed", "error");
          setExporting(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
      Swal.fire("Error", "Export failed", "error");
      setExporting(false);
    }
  };

  return { handleExport, exporting, progress };
};

export default useBandiExport;
