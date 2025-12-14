// ---------------------------------------------------------
// TRANSICIÓN GLOBAL SUAVE
// ---------------------------------------------------------
const transitionCSS = `
    html, body, body * {
        transition: 
            background-color 0.4s ease-in-out,
            color 0.4s ease-in-out,
            border-color 0.4s ease-in-out,
            fill 0.4s ease-in-out,
            stroke 0.4s ease-in-out;
    }
`;
let styleTransition = document.createElement("style");
styleTransition.innerHTML = transitionCSS;
document.head.appendChild(styleTransition);

// ---------------------------------------------------------
// LEER PARÁMETRO DE URL
// ---------------------------------------------------------
function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// ---------------------------------------------------------
// 1. TRADUCTOR AUTOMÁTICO
// ---------------------------------------------------------
async function translatePage(targetLang) {
    const nodes = document.querySelectorAll("body *:not(script):not(style)");
    let texts = [];

    nodes.forEach(el => {
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
            const txt = el.innerText.trim();
            if (txt) texts.push(txt);
        }
    });

    if (texts.length === 0) return;

    const unique = [...new Set(texts)];
    const joined = encodeURIComponent(unique.join("|||"));

    try {
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${joined}`
        );

        const data = await response.json();
        const translated = data[0].map(item => item[0]).join("").split("|||");

        let map = {};
        unique.forEach((orig, i) => map[orig] = translated[i]);

        nodes.forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                const t = el.innerText.trim();
                if (map[t]) el.innerText = map[t];
            }
        });

    } catch (error) {
        console.error("Error traducción:", error);
    }
}


// ---------------------------------------------------------
// 2. TEMAS REALES FINAL
// ---------------------------------------------------------
function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === "light") {
        root.setAttribute("data-theme", "light");

        // FONDO CLARO
        document.body.style.backgroundColor = "#ffffff";
        document.body.style.color = "#000000";

        // BOOTSTRAP VARIABLES
        root.style.setProperty("--bs-body-bg", "#ffffff");
        root.style.setProperty("--bs-body-color", "#000000");

        root.style.setProperty("--bs-primary", "#000000");
        root.style.setProperty("--bs-link-color", "#000000");

        // HOVERS
        root.style.setProperty("--hover-bg", "#000000");
        root.style.setProperty("--hover-text", "#ffffff");

        // Ajustar todos los textos
        document.querySelectorAll("*").forEach(el => {
            if (window.getComputedStyle(el).color)
                el.style.color = "#000000";
        });
    }

    if (theme === "dark") {
        root.setAttribute("data-theme", "dark");

        // FONDO OSCURO
        document.body.style.backgroundColor = "#000000";
        document.body.style.color = "#ffffff";

        // BOOTSTRAP VARIABLES
        root.style.setProperty("--bs-body-bg", "#000000");
        root.style.setProperty("--bs-body-color", "#ffffff");

        root.style.setProperty("--bs-primary", "#ffffff");
        root.style.setProperty("--bs-link-color", "#ffffff");

        // HOVERS
        root.style.setProperty("--hover-bg", "#ffffff");
        root.style.setProperty("--hover-text", "#000000");

        // Ajustar todos los textos
        document.querySelectorAll("*").forEach(el => {
            if (window.getComputedStyle(el).color)
                el.style.color = "#ffffff";
        });
    }
}


// ---------------------------------------------------------
// 3. APLICAR HOVERS
// ---------------------------------------------------------
function applyHoverEffects() {
    const css = `
        *:hover {
            transition: 0.3s ease-in-out;
        }
        a:hover, button:hover, .btn:hover {
            background-color: var(--hover-bg) !important;
            color: var(--hover-text) !important;
        }
    `;

    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
}


// ---------------------------------------------------------
// 4. APLICAR AUTOMÁTICAMENTE AL CARGAR
// ---------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    const lang = getParam("lang");
    const theme = getParam("theme");

    // APLICAR TEMA PRIMERO
    if (theme === "light") applyTheme("light");
    if (theme === "dark") applyTheme("dark");

    // TRADUCIR
    if (lang) translatePage(lang);

    applyHoverEffects();
});
