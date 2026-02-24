const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";
const primaryColorScheme = "";

function getPreferTheme() {
  const currentTheme = localStorage.getItem(THEME);
  if (currentTheme) return currentTheme;
  if (primaryColorScheme) return primaryColorScheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

let themeValue = window.theme?.themeValue ?? getPreferTheme();

function reflectPreference() {
  document.firstElementChild?.setAttribute("data-theme", themeValue);

  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);
  document
    .querySelector("#theme-btn-mobile")
    ?.setAttribute("aria-label", themeValue);

  const body = document.body;
  if (body) {
    const computedStyles = window.getComputedStyle(body);
    const bgColor = computedStyles.backgroundColor;
    document
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
}

function setPreference() {
  localStorage.setItem(THEME, themeValue);
  reflectPreference();
}

if (window.theme) {
  window.theme.setPreference = setPreference;
  window.theme.reflectPreference = reflectPreference;
} else {
  window.theme = {
    themeValue,
    setPreference,
    reflectPreference,
    getTheme: () => themeValue,
    setTheme: val => {
      themeValue = val;
    },
  };
}

reflectPreference();

function bindThemeButton(selector, toggleTheme) {
  const btn = document.querySelector(selector);
  if (!btn) return;

  const fresh = btn.cloneNode(true);
  btn.replaceWith(fresh);
  fresh.addEventListener("click", toggleTheme);
}

function setThemeFeature() {
  reflectPreference();

  const toggleTheme = () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  };

  bindThemeButton("#theme-btn", toggleTheme);
  bindThemeButton("#theme-btn-mobile", toggleTheme);
}

setThemeFeature();
document.addEventListener("astro:after-swap", setThemeFeature);

document.addEventListener("astro:before-swap", event => {
  const bgColor = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");

  if (bgColor) {
    event.newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", bgColor);
  }
});

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    themeValue = isDark ? DARK : LIGHT;
    window.theme?.setTheme(themeValue);
    setPreference();
  });
