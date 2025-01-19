// dist/js/cookies.js

if (!localStorage.getItem('cookieConsent')) {
    const cookieConsent = document.getElementById('cookieConsent');
    if (cookieConsent) {
        cookieConsent.classList.remove('d-none');

        const acceptCookiesButton = document.getElementById('acceptCookies');
        const rejectCookiesButton = document.getElementById('rejectCookies');

        if (acceptCookiesButton) {
            acceptCookiesButton.addEventListener('click', () => {
                cookieConsent.classList.add('d-none');
                localStorage.setItem('cookieConsent', 'accepted');
                // Включаем аналитику
                gtag('config', 'G-LLPYE4ZPZQ'); // Google Analytics
                ym(99580047, 'init', { // Yandex.Metrica
                    clickmap: true,
                    trackLinks: true,
                    accurateTrackBounce: true,
                    webvisor: true
                });
            });
        }

        if (rejectCookiesButton) {
            rejectCookiesButton.addEventListener('click', () => {
                cookieConsent.classList.add('d-none');
                localStorage.setItem('cookieConsent', 'rejected');
                // Отключаем аналитику
                gtag('config', 'G-LLPYE4ZPZQ', { 'anonymize_ip': true }); // Google Analytics
                ym(99580047, 'init', { // Yandex.Metrica
                    clickmap: false,
                    trackLinks: false,
                    accurateTrackBounce: false,
                    webvisor: false
                });
            });
        }

        const showPolicyLink = document.getElementById('showPolicy');
        const policyText = document.getElementById('policyText');
        if (showPolicyLink && policyText) {
            showPolicyLink.addEventListener('click', (e) => {
                e.preventDefault();
                policyText.classList.toggle('show');
                policyText.style.display = policyText.classList.contains('show') ? 'block' : 'none';
            });
        }
    }
}