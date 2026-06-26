document.addEventListener('DOMContentLoaded', onPageLoad, false);

function onPageLoad() {
    if(localStorage.getItem('bb_user')) {
        document.getElementById('username').value = localStorage.getItem('bb_user');
        document.getElementById('password').value = localStorage.getItem('bb_pass');
    }
}

document.getElementById('saveLoginBtn').addEventListener('click', () => {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if(!user || !pass) {
        alert('Authentication failed: Please enter both username and password.');
        return;
    }

    localStorage.setItem('bb_user', user);
    localStorage.setItem('bb_pass', pass);

    // লগইন কার্ডটি ছোট করে পোর্টাল ফ্রেমটি স্ক্রিনে নিয়ে আসা
    document.getElementById('loginSection').style.padding = "10px";
    document.getElementById('portalFrame').style.display = "block";
    document.getElementById('searchPaperBtn').style.display = "block";

    // আইফ্রেমের ভেতরে বাংলারভূমি পোর্টাল লোড করা হচ্ছে
    const iframe = document.getElementById('portalFrame');
    iframe.src = "https://banglarbhumi.gov.in";

    // ফ্রেম লোড হওয়ার পর অটো-ফিল ও রিফ্রেশ সচল করা
    iframe.onload = function() {
        try {
            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // ইউজারনেম পাসওয়ার্ড অটো-ফিল করা
            if(frameDoc.getElementById('username')) {
                frameDoc.getElementById('username').value = user;
                frameDoc.getElementById('password').value = pass;
            }

            // সেশন ধরে রাখার জন্য প্রতি ২৫ সেকেন্ডে ব্যাকগ্রাউন্ড পালস চালু
            setInterval(() => {
                iframe.contentWindow.postMessage('refresh', '*');
            }, 25000);

        } catch (e) {
            console.log("Cross-origin restriction handled safely.");
        }
    };
});
