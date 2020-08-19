const { detect } = require('detect-browser');
const browser = detect();

const checkBrowser = (browserName) => {
    if (browser) {
        if(browser.name === browserName) {
            document.querySelector('body').classList.add(`is-${browserName}`);
        }
    }
}

checkBrowser('firefox');
checkBrowser('chrome');
checkBrowser('safari');