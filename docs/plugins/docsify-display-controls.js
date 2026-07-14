const fontSizeIncrement = 1; // in pixels

function getCurrentFontSize() {
    const markdownSection = document.querySelector('.markdown-section#main');
    return parseFloat(window.getComputedStyle(markdownSection).fontSize);
}

function setFontSize(size) {
    const markdownSection = document.querySelector('.markdown-section#main');
    markdownSection.style.setProperty('--font-size', `${size}px`);
    localStorage.setItem('font-size', size);
}

function adjustFontSize(action) {
    const currentSize = getCurrentFontSize();

    const newSize = action === 'increase' ? currentSize + fontSizeIncrement : currentSize - fontSizeIncrement;
    if (newSize < 10) return; // Prevent font size from becoming too small

    setFontSize(newSize);
}

function toggleDarkMode() {
    const element = document.querySelector('body');
    element.classList.toggle("docsify-dark-mode");

    if (element.classList.contains("docsify-dark-mode")) {
        localStorage.setItem('docsify-dark-mode', 'true');
    } else {
        localStorage.removeItem('docsify-dark-mode');
    }
}

function shouldApplyDarkMode() {
    return localStorage.getItem('docsify-dark-mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyDarkMode() {
    document.querySelector('body').classList.add("docsify-dark-mode");
}

function applyInitialSettings() {
    if (shouldApplyDarkMode()) {
        applyDarkMode();
    }
    const savedSize = parseFloat(localStorage.getItem('font-size'));
    if (savedSize) {
        setFontSize(savedSize);
    }
}

document.addEventListener('DOMContentLoaded', applyInitialSettings);

function styleInject(css, ref) {
    if (ref === void 0) ref = {};
    const insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') {
        return;
    }

    const head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
        if (head.firstChild) {
            head.insertBefore(style, head.firstChild);
        } else {
            head.appendChild(style);
        }
    } else {
        head.appendChild(style);
    }

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
}

const button_css = `
:root {
    --font-size-increase-icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'%3E%3Cpath d='m40-200 210-560h100l210 560h-96l-51-143H187l-51 143H40Zm176-224h168l-82-232h-4l-82 232Zm504 104v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z'/%3E%3C/svg%3E");
    --font-size-decrease-icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'%3E%3Cpath d='m40-200 210-560h100l210 560h-96l-51-143H187l-51 143H40Zm176-224h168l-82-232h-4l-82 232Zm384-16v-80h320v80H600Z'/%3E%3C/svg%3E");
    --dark-moon-icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'%3E%3Cpath d='M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z'/%3E%3C/svg%3E");
    --dark-sun-icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24'%3E%3Cpath d='M480-360q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0 80q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z'/%3E%3C/svg%3E");
    --dark-moon-color: #555;
    --dark-sun-color: #f5c518;
    --starting-right-position: 8.3%;
    --icon-size: 32px;
    --icon-spread: 1.6;
    --icon-top-offset: calc(var(--icon-size) * var(--icon-spread));
}

button[onclick="adjustFontSize('increase')"] {
    mask-image: var(--font-size-increase-icon);
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: calc(var(--icon-size) * 1.2) calc(var(--icon-size) * 1.2);
    width: calc(var(--icon-size) * 1.2);
    height: calc(var(--icon-size) * 1.2);
    background: #000000;
    transition: background 0.2s ease;
    top: var(--icon-top-offset);
    right: calc(var(--icon-size) * var(--icon-spread) * 2 + var(--starting-right-position));
}

.docsify-dark-mode button[onclick="adjustFontSize('increase')"] {
    background: var(--dark-base-color);
}

button[onclick="adjustFontSize('decrease')"] {
    mask-image: var(--font-size-decrease-icon);
    mask-position: center;
    mask-repeat: no-repeat;
    mask-size: calc(var(--icon-size) * 1.2) calc(var(--icon-size) * 1.2);
    width: calc(var(--icon-size) * 1.2);
    height: calc(var(--icon-size) * 1.2);
    background: #000000;
    transition: background 0.2s ease;
    top: var(--icon-top-offset);
    right: calc(var(--icon-size) * var(--icon-spread) + var(--starting-right-position));
    }
    
.docsify-dark-mode button[onclick="adjustFontSize('decrease')"] {
    background: var(--dark-base-color);
}

button[onclick="toggleDarkMode()"] {
    background: var(--dark-moon-color);
    mask-image: var(--dark-moon-icon);
    mask-size: var(--icon-size) var(--icon-size);
    width: var(--icon-size);
    height: var(--icon-size);
    transition: .1s ease-in-out .1s;
    right: var(--starting-right-position);
    top: calc(var(--icon-top-offset) * 1.08);
}

.docsify-dark-mode button[onclick="toggleDarkMode()"] {
    background: var(--dark-sun-color);
    mask-image: var(--dark-sun-icon);
}

.docsify-dark-mode .cover .mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--dark-cover-background);
}

button.display-control-button {
    position: absolute;
    
    padding: 0;
    border: none;
    cursor: pointer;
    z-index: 1000;
}`

const font_size_body_settings_css = `
.markdown-section {
    --font-size: 15px;
    font-size: var(--font-size);
}

.markdown-section code {
    font-size: calc(var(--font-size) - 2px) !important;
}

.markdown-section ol, .markdown-section p, .markdown-section ul {
    line-height: calc(var(--font-size) * 2);
}

.markdown-section h1 {
    font-size: calc(var(--font-size) * 2.3);
}

.markdown-section h2 {
    font-size: calc(var(--font-size) * 2.1);
}

.markdown-section h3 {
    font-size: calc(var(--font-size) * 1.8);
}

.markdown-section h4 {
    font-size: calc(var(--font-size) * 1.5);
}

.markdown-section h5 {
    font-size: calc(var(--font-size) * 1.3);
}

.markdown-section h6 {
    font-size: calc(var(--font-size) * 1.1);
}

.docsify-dark-mode .cover .mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--dark-cover-background);
}`

const dark_mode_body_settings_css = `
.docsify-dark-mode,
.docsify-dark-mode .sidebar,
.docsify-dark-mode .search input,
.docsify-dark-mode .markdown-section tr:nth-child(2n),
.docsify-dark-mode .app-nav li ul {
    background: var(--dark-base-background);
    color: var(--dark-base-color);
}

.docsify-dark-mode .markdown-section code,
.docsify-dark-mode .markdown-section pre,
.docsify-dark-mode .markdown-section p.tip code {
    background: var(--dark-code-background);
    color: var(--dark-code-color);
}

.docsify-dark-mode .markdown-section p.tip {
    background: var(--dark-tip-background);
}

.docsify-dark-mode .markdown-section p.warn {
    background: var(--dark-warn-background);
}

.docsify-dark-mode .anchor span {
    color: var(--dark-heading-color);
}

.docsify-dark-mode .sidebar ul li.active>a {
    color: var(--dark-theme-color);
    border-color: var(--dark-theme-color);
}

.docsify-dark-mode .sidebar ul li a, .docsify-dark-mode .markdown-section strong {
    color: var(--dark-base-color);
}

@media screen and (min-width:769px) {
    .docsify-dark-mode .sidebar-toggle {
        background: rgb(0 0 0 / .6);
    }
}`

styleInject(button_css);
styleInject(font_size_body_settings_css);
styleInject(dark_mode_body_settings_css);

function getDarkModeButton() {
    const darkModeButton = document.createElement('button');
    darkModeButton.setAttribute('onclick', 'toggleDarkMode()');
    darkModeButton.className = 'display-control-button';
    darkModeButton.setAttribute('aria-label', 'Toggle dark mode');
    darkModeButton.setAttribute('title', 'Toggle dark mode');
    return darkModeButton;
}

function getIncreaseFontSizeButton() {
    const increaseFontSizeButton = document.createElement('button');
    increaseFontSizeButton.setAttribute('onclick', 'adjustFontSize(\'increase\')');
    increaseFontSizeButton.className = 'display-control-button';
    increaseFontSizeButton.setAttribute('aria-label', 'Increase font size');
    increaseFontSizeButton.setAttribute('title', 'Increase font size');
    return increaseFontSizeButton;
}

function getDecreaseFontSizeButton() {
    const decreaseFontSizeButton = document.createElement('button');
    decreaseFontSizeButton.setAttribute('onclick', 'adjustFontSize(\'decrease\')');
    decreaseFontSizeButton.className = 'display-control-button';
    decreaseFontSizeButton.setAttribute('aria-label', 'Decrease font size');
    decreaseFontSizeButton.setAttribute('title', 'Decrease font size');
    return decreaseFontSizeButton;
}

function install(hook, vm) {
    hook.ready(function () {
        document.body.appendChild(getDarkModeButton());
        document.body.appendChild(getIncreaseFontSizeButton());
        document.body.appendChild(getDecreaseFontSizeButton());
    });
}

$docsify.plugins = [].concat(install, $docsify.plugins);