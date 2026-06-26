document.addEventListener('DOMContentLoaded', onPageLoad, false);

function onPageLoad() {
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

    // Directly redirect inside the App without needing InAppBrowser plugin
    window.location.href = "https://banglarbhumi.gov.in";
});
