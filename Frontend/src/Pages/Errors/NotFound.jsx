export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.code}>404</h1>
        <h1 style={styles.code}>Not Found</h1>

        {/* minimal soft illustration */}
        <svg
          width="180"
          height="140"
          viewBox="0 0 300 200"
          style={{ marginBottom: 20 }}
        >
          <circle cx="150" cy="100" r="80" fill="#f2f5ff" />
          <path
            d="M110 120 L150 80 L190 120"
            stroke="#8892b0"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="150" cy="135" r="6" fill="#8892b0" />
        </svg>

        <p style={styles.text}>The page you are looking for does not exist.</p>
        <p style={styles.text}>Please contact DOPM IT</p>

        <button style={styles.button} onClick={() => window.history.back()}>
          ← Go Back
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
    fontSize: "120px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-5px",
    color: "#3f51b5",
  },
  text: {
    fontSize: "20px",
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
