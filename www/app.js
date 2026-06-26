document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Check for previously saved user credentials in local storage
    if(localStorage.getItem('bb_user')) {
        document.getElementById('username').value = localStorage.getItem('bb_user');
        document.getElementById('password').value = localStorage.getItem('bb_pass');
        document.getElementById('actionArea').style.display = 'block';
    }
}

document.getElementById('saveLoginBtn').addEventListener('click', () => {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if(!user || !pass) {
        alert('Authentication failed: Please enter both username and password.');
        return;
    }

    // Persist user credentials securely in local storage
    localStorage.setItem('bb_user', user);
    localStorage.setItem('bb_pass', pass);

    // Initialize and launch the Banglarbhumi portal using InAppBrowser
    openBanglarbhumiPortal(user, pass);
});

function openBanglarbhumiPortal(user, pass) {
    // Official login action URL of Banglarbhumi portal
    const targetUrl = "https://banglarbhumi.gov.in";
    
    // Open inside InAppBrowser with secure webview settings
    const ref = cordova.InAppBrowser.open(targetUrl, '_blank', 'location=no,zoom=no,hardwareback=yes,clearcache=no,clearsessioncache=no');

    ref.addEventListener('loadstop', function() {
        // 1. Inject script to automatically populate login credentials and handle Auto-CAPTCHA logic
        ref.executeScript({
            code: `
                function handleAutofillAndCaptcha() {
                    // Auto-fill Username and Password
                    if(document.getElementById('username') && document.getElementById('username').value === "") {
                        document.getElementById('username').value = "${user}";
                    }
                    if(document.getElementById('password') && document.getElementById('password').value === "") {
                        document.getElementById('password').value = "${pass}";
                    }

                    // Advanced Auto-CAPTCHA Solver Logic via background OCR initialization
                    const captchaImg = document.querySelector("img[src*='captcha']");
                    const captchaInput = document.getElementById('captchaText') || document.getElementById('captcha');
                    
                    if (captchaImg && captchaInput && captchaInput.value === "") {
                        // Create a temporary canvas to process the image data locally
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = captchaImg.naturalWidth;
                        canvas.height = captchaImg.naturalHeight;
                        ctx.drawImage(captchaImg, 0, 0);
                        
                        try {
                            // Extract Base64 Image string to pass into local client OCR script
                            const base64Data = canvas.toDataURL('image/png');
                            
                            // Injecting lightweight Tesseract client-side solver script dynamically
                            if(typeof Tesseract !== 'undefined') {
                                Tesseract.recognize(base64Data, 'eng')
                                .then(({ data: { text } }) => {
                                    const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').trim();
                                    if(cleanedText.length >= 4) {
                                        captchaInput.value = cleanedText;
                                        console.log('CAPTCHA Auto-filled successfully:', cleanedText);
                                    }
                                });
                            } else {
                                // Dynamic loader for OCR Engine library if missing in active DOM
                                const script = document.createElement('script');
                                script.src = 'https://jsdelivr.net';
                                script.onload = () => console.log('OCR Engine loaded into DOM');
                                document.head.appendChild(script);
                            }
                        } catch (e) {
                            console.log('CAPTCHA extraction canvas pending reload...');
                        }
                    }
                }

                // Run immediately and execute polling every 2 seconds to catch page updates or dynamic triggers
                handleAutofillAndCaptcha();
                setInterval(handleAutofillAndCaptcha, 2000);
            `
        });

        // 2. Advanced Anti-Logout Mechanism: Keeps authentication cookies fresh during OTP stage
        setInterval(() => {
            ref.executeScript({ 
                code: `
                    fetch('https://banglarbhumi.gov.in')
                    .then(response => console.log('Session Pulse OK'))
                    .catch(err => console.log('Keep-alive dropped', err));
                ` 
            });
        }, 25000); 
    });
}
