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
    if (!results || !results || !results.result) {
      alert("পেজে কোনো জমির তথ্য খুঁজে পাওয়া যায়নি! আগে 'Know Your Property' রেজাল্ট বের করুন।");
      return;
    }

    const data = results.result;
    const reportWindow = window.open();
    reportWindow.document.write(generateSearchingPaperHTML(data));
    reportWindow.document.close();
  });
});

// এই ফাংশনটি এখন পেজের সমস্ত প্রয়োজনীয় টেবিল (দাগ এবং খতিয়ান উভয়ই) তুলে নেবে
function extractBanglarbhumiData() {
  const tables = document.querySelectorAll("table"); 
  if (tables.length === 0) return null;

  let htmlContent = "";
  tables.forEach((table) => {
    const text = table.innerText;
    // দাগের বিবরণ, খতিয়ানের বিবরণ, মালিকের নাম বা শেয়ার সংক্রান্ত যেকোনো টেবিল পেলেই তা স্ক্র্যাপ করবে
    if (
      text.includes("Khatian") || 
      text.includes("Plot") || 
      text.includes("Name") || 
      text.includes("Share") || 
      text.includes("খতিয়ান") || 
      text.includes("দাগ") || 
      text.includes("মালিকের") ||
      text.includes("শ্রেণী")
    ) {
      htmlContent += table.outerHTML + "<br>";
    }
  });

  return htmlContent ? htmlContent : null;
}

// এই ফাংশনটি আপনার দেওয়া লোগো দিয়ে সুন্দর সার্চিং পেপার ফরম্যাট তৈরি করবে
function generateSearchingPaperHTML(tableData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Land Searching Report</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; padding: 30px; background-color: #fafafa; color: #000; }
        .report-container { max-width: 850px; margin: 0 auto; background: white; padding: 40px; border: 2px dashed #333; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .header img { max-width: 100%; height: auto; max-height: 90px; margin-bottom: 5px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; color: #333; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .meta-info { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 20px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
        th, td { border: 1px solid #000; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
        .content { margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #ccc; padding-top: 10px; }
        .print-btn { background: #000; color: #fff; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; margin-bottom: 20px; font-size: 14px; border-radius: 4px; }
        @media print { .print-btn { display: none; } body { padding: 0; background: white; } .report-container { border: none; box-shadow: none; padding: 0; } }
      </style>
    </head>
    <body>
      <div style="text-align:center;"><button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button></div>
      <div class="report-container">
        <div class="header">
          <!-- এখানে আপনার দেওয়া লোগোটি স্থায়ীভাবে বসানো হয়েছে -->
          <img src="https://banglarbhumi.gov.in/BanglarBhumi/images/bl.png" alt="Banglarbhumi Logo">
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
