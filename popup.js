document.getElementById('generateBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes("banglarbhumi.gov.in")) {
    alert("অনুগ্রহ করে আগে বাংলারভূমি ওয়েবসাইটটি খুলুন এবং তথ্য বের করুন।");
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractBanglarbhumiFullPage
  }, (results) => {
    if (!results || !results || !results.result) {
      alert("পেজে কোনো জমির তথ্য খুঁজে পাওয়া যায়নি! আগে সঠিক তথ্য বের করুন।");
      return;
    }

    const data = results.result;
    const reportWindow = window.open();
    reportWindow.document.write(generateSearchingPaperHTML(data));
    reportWindow.document.close();
  });
});

// এই ফাংশনটি পুরো বাংলারভূমি পেজের ম্যাপ, হেডার টেক্সট এবং সব টেবিল হুবহু তুলে নেয়
function extractBanglarbhumiFullPage() {
  // ১. জেলা, ব্লক, মৌজার মতো গুরুত্বপূর্ণ টেক্সট ইনফো খোঁজা
  let textDetails = "";
  const container = document.body;
  
  // বাংলারভূমির নো-ইউর-প্রপার্টি সেকশনের মূল ডাটা কন্টেইনার টার্গেট করা
  const elements = container.querySelectorAll("div, p, td");
  let foundMeta = false;
  elements.forEach((el) => {
    if ((el.innerText.includes("জেলাঃ") || el.innerText.includes("মৌজাঃ") || el.innerText.includes("Live Data")) && el.children.length === 0) {
      textDetails += `<p style="margin: 4px 0; font-weight: bold; font-size: 14px;">${el.innerText}</p>`;
      foundMeta = true;
    }
  });

  // যদি কাস্টম এলিমেন্ট না মেলে, তবে সাধারণ টেক্সট থেকে খোঁজা
  if (!foundMeta) {
    const pageText = container.innerText;
    const lines = pageText.split('\n');
    lines.forEach(line => {
      if (line.includes("জেলাঃ") || line.includes("ব্লকঃ") || line.includes("মৌজাঃ") || line.includes("Live Data") || line.includes("জে.এল নং")) {
        textDetails += `<p style="margin: 4px 0; font-weight: bold; font-size: 14px;">${line.trim()}</p>`;
      }
    });
  }

  // ২. পেজের সমস্ত টেবিল (দাগ নম্বর এবং খতিয়ান নম্বর) স্ক্র্যাপ করা
  let tablesHtml = "";
  const tables = document.querySelectorAll("table");
  tables.forEach((table) => {
    if (table.innerText.includes("দাগ") || table.innerText.includes("খতিয়ান") || table.innerText.includes("Plot") || table.innerText.includes("Khatian")) {
      // বাংলারভূমির আসল স্টাইল ধরে রাখার জন্য ক্লাস ও আইডি ইনজেক্ট করা
      tablesHtml += `<div class="table-wrapper">${table.outerHTML}</div><br>`;
    }
  });

  // ৩. প্লটের লাইভ ম্যাপ বা ইমেজ খুঁজে বের করা (যদি ম্যাপ শো করানো থাকে)
  let mapHtml = "";
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    // লোগো বাদে অন্য কোনো ম্যাপ বা প্লটের ইমেজ থাকলে তা ক্যাপচার করবে
    if (img.src && !img.src.includes("bl.png") && (img.src.includes("map") || img.src.includes("plot") || img.width > 200)) {
      mapHtml += `<div class="map-container"><h3>দাগের ম্যাপ (Plot Map)</h3><img src="${img.src}" style="max-width: 100%; border: 1px solid #ccc; padding: 5px;" /></div>`;
    }
  });

  // ওপরে খোঁজা সমস্ত ডাটা অবজেক্ট আকারে পাঠানো হচ্ছে
  return {
    meta: textDetails,
    tables: tablesHtml,
    map: mapHtml
  };
}

// এটি নতুন পেজের জন্য প্রফেশনাল 'Searching Paper' লেআউট তৈরি করবে
function generateSearchingPaperHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Land Searching Report</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Courier New', Courier, monospace, Arial; padding: 20px; background-color: #f5f5f5; color: #000; }
        .report-container { max-width: 850px; margin: 0 auto; background: white; padding: 30px; border: 2px dashed #000; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
        
        /* টপ হেডার লোগো */
        .top-logo-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .top-logo-header img { max-width: 100%; height: auto; max-height: 85px; }
        
        /* মেটা ইনফরমেশন (জেলা, ব্লক, মৌজা) */
        .meta-section { background-color: #fafafa; border: 1px solid #ddd; padding: 12px; margin-bottom: 15px; border-radius: 4px; text-align: center; }
        
        /* টেবিল ডিজাইন */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; vertical-align: middle; }
        th { background-color: #f2f2f2; font-weight: bold; }
        
        /* ম্যাপ সেকশন */
        .map-container { margin-top: 25px; text-align: center; border-top: 1px dashed #333; padding-top: 15px; }
        .map-container h3 { font-size: 16px; margin-bottom: 10px; text-transform: uppercase; }
        
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #555; border-top: 1px solid #ccc; padding-top: 10px; }
        .print-btn { background: #27ae60; color: #fff; border: none; padding: 12px 25px; font-weight: bold; cursor: pointer; margin-bottom: 15px; font-size: 14px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .print-btn:hover { background: #219653; }
        
        @media print { 
          .print-btn { display: none; } 
          body { padding: 0; background: white; } 
          .report-container { border: none; box-shadow: none; padding: 0; } 
        }
      </style>
    </head>
    <body>
      <div style="text-align:center;"><button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button></div>
      
      <div class="report-container">
        <!-- আপনার দেওয়া ছবি অনুযায়ী লোগোটি সবার ওপরে (TOP) সেট করা হয়েছে -->
        <div class="top-logo-header">
          <img src="https://banglarbhumi.gov.in" alt="Banglarbhumi">
        </div>
        
        <!-- জেলা, ব্লক, মৌজা এবং লাইভ ডাটার সময় এখানে দেখাবে -->
        <div class="meta-section">
          ${data.meta ? data.meta : '<p>No Location Metadata Found</p>'}
        </div>
        
        <!-- দাগ ও খতিয়ানের সমস্ত টেবিল ডাটা -->
        <div class="content">
          ${data.tables ? data.tables : '<p style="text-align:center; color:red;">কোনো টেবিল ডাটা পাওয়া যায়নি।</p>'}
        </div>
        
        <!-- ম্যাপ সেকশন (যদি পেজে ম্যাপ লোড হয়ে থাকে তবেই এখানে দেখাবে) -->
        ${data.map}
        
        <div class="footer">
          <p>This is a computer-generated searching paper format helper. Data source: banglarbhumi.gov.in</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
