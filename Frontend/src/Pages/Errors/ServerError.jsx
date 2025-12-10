export default function Forbidden() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.code}>403</h1>      
        <h1 style={styles.code}>Forbidden</h1>      

        {/* Simple minimal illustration */}
        <svg
          width="180"
          height="140"
          viewBox="0 0 300 200"
          style={{ marginBottom: 20 }}
        >
          <circle cx="150" cy="100" r="80" fill="#f2f5ff" />
          <rect x="110" y="60" width="80" height="90" rx="10" fill="#ccd6f6" />
          <line x1="110" y1="80" x2="190" y2="80" stroke="#8892b0" strokeWidth="4" />
        </svg>

        <h1 style={styles.text}>You don’t have permission to access this page.</h1>
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
    fontSize: "100px",
    fontWeight: "900",
    margin: 0,
    letterSpacing: "-5px",
    color: "#f60505ff",
  },
  text: {
    // fontSize: "20px",
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
