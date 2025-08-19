import { bs2ad } from "./bs2ad.js"; // adjust path if needed

async function runTests() {
  const tests = [
    "2081-05-01", // should be around Aug 2024
    "2079-01-01", // around mid-April 2022
    "2080-12-30", // late March 2024
    "2090-01-01", // boundary case
    "1999-01-01", // invalid (too small)
    "2081-13-01", // invalid month
    "2081-05-29"  // invalid day
  ];

  for (const bsDate of tests) {
    const adDate = await bs2ad(bsDate);
    console.log(`${bsDate} => ${adDate}`);
  }
}

runTests();
