const HEALTH_CHECK_PATH = "/auth/health";
// const BASE_API_PATH = "/api"; // relative path for proxy
const BASE_API_PATH = import.meta.env.MODE==="development"
                    ? "http://localhost:3003" //backend port in development
                    : "/api";  //relative proxy path in production

const fetchWithTimeout = (url, options = {}, timeout = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
};

export const getAvailableBaseUrl = async () => {
  const url = `${BASE_API_PATH}${HEALTH_CHECK_PATH}`;

  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      console.log(`✅ Backend reachable via proxy: ${url}`);
      return BASE_API_PATH;
    }
  } catch (err) {
    console.warn(`❌ Backend not reachable via proxy: ${url}`);
  }

  console.error("⚠️ Backend is not reachable!");
  return null;
};
