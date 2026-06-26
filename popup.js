document.getElementById('generateBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes("banglarbhumi.gov.in")) {
    alert("অনুগ্রহ করে আগে বাংলারভূমি ওয়েবসাইটটি খুলুন এবং তথ্য বের করুন।");
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractBanglarbhumiData
  }, (results) => {
    if (!results || !results[0] || !results[0].result) {
      alert("পেজে কোনো জমির তথ্য খুঁজে পাওয়া যায়নি! আগে 'Know Your Property' রেজাল্ট বের করুন।");
      return;
    }

    const data = results[0].result;
    const reportWindow = window.open();
    reportWindow.document.write(generateSearchingPaperHTML(data));
    reportWindow.document.close();
  });
});

function extractBanglarbhumiData() {
  const tables = document.querySelectorAll("table"); 
  if (tables.length === 0) return null;

  let htmlContent = "";
  tables.forEach((table) => {
    if(table.innerText.includes("Khatian") || table.innerText.includes("Plot") || table.innerText.includes("Name") || table.innerText.includes("খতিয়ান") || table.innerText.includes("দাগ")) {
      htmlContent += table.outerHTML + "<br>";
    }
  });

  return htmlContent ? htmlContent : null;
}

function generateSearchingPaperHTML(tableData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Land Searching Report</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; padding: 30px; background-color: #fafafa; color: #000; }
        .report-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border: 2px dashed #333; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; color: #555; }
        .meta-info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
        th, td { border: 1px solid #000; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #ccc; padding-top: 10px; }
        .print-btn { background: #000; color: #fff; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; margin-bottom: 20px; }
        @media print { .print-btn { display: none; } body { padding: 0; background: white; } .report-container { border: none; box-shadow: none; padding: 0; } }
      </style>
    </head>
    <body>
      <div style="text-align:center;"><button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button></div>
      <div class="report-container">
        <div class="header">
          <h1>LAND SEARCHING REPORT</h1>
          <p>Verified via Banglarbhumi Portal</p>
        </div>
        <div class="meta-info">
          <div>Report Date: ${new Date().toLocaleDateString('en-IN')}</div>
          <div>Status: Official Scraped Data</div>
        </div>
        <div class="content">
          ${tableData}
        </div>
        <div class="footer">
          <p>This is a computer-generated searching paper format helper. Data source: banglarbhumi.gov.in</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
