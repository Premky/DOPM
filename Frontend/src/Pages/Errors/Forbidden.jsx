import { useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useBaseURL } from "../../Context/BaseURLProvider";
import axios from "axios";

export default function Forbidden() {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = useBaseURL();

  useEffect(() => {
    const autoLogout = async () => {
      try {
        await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });

        // Clear auth state
        dispatch({ type: "LOGOUT" });
        localStorage.clear();
        sessionStorage.clear();

        Swal.fire({
          title: "Access Denied",
          text: "You were logged out due to invalid permissions.",
          icon: "warning",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Auto logout failed:", error);
      }
    };

    autoLogout();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.code}>403</h1>
        <h1 style={styles.code}>Forbidden</h1>

        {/* Illustration */}
        <svg
          width="180"
          height="140"
          viewBox="0 0 300 200"
          style={{ marginBottom: 20 }}
        >
          <circle cx="150" cy="100" r="80" fill="#f2f5ff" />
          <rect x="110" y="60" width="80" height="90" rx="10" fill="#ccd6f6" />
          <line
            x1="110"
            y1="80"
            x2="190"
            y2="80"
            stroke="#8892b0"
            strokeWidth="4"
          />
        </svg>

        <h2 style={styles.text}>You don’t have permission to access this page.</h2>
        <p style={styles.text}>Please contact DOPM IT</p>

        <button style={styles.button} onClick={() => navigate("/login")}>
          Go to Login →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fbff",
  },
  content: {
    textAlign: "center",
  },
  code: {
    fontSize: "100px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-5px",
    color: "#f60505ff",
  },
  text: {
    color: "#606c88",
    marginBottom: "25px",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#3f51b5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
