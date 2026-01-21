import { Timeline, TimelineItem, TimelineContent } from "@mui/lab";
import axios from "axios";
import { useEffect, useState } from "react";

const AuditTab = ({ employeeId }) => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    axios.get(`/api/employee/${employeeId}/audit`)
      .then(res => setLogs(res.data));
  }, []);

  return (
    <Timeline>
      {logs.map(log => (
        <TimelineItem key={log.id}>
          <TimelineContent>
            <strong>{log.action}</strong><br />
            {log.performed_by}<br />
            {new Date(log.created_at).toLocaleString()}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};
export default AuditTab;