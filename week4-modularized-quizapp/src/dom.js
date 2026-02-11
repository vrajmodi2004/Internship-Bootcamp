export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const hide = (element) => {
    if (typeof element === 'string') element = $(element);
    if (element) element.style.display = 'none';
};

export const show = (element, displayType = 'block') => {
    if (typeof element === 'string') element = $(element);
    if (element) element.style.display = displayType;
};

export const setText = (selector, text) => {
    const element = typeof selector === 'string' ? $(selector) : selector;
    if (element) element.textContent = text;
};

export const setHTML = (selector, html) => {
    const element = typeof selector === 'string' ? $(selector) : selector;
    if (element) element.innerHTML = html;
};

export const addClass = (element, className) => {
    if (typeof element === 'string') element = $(element);
    if (element) element.classList.add(className);
};

export const removeClass = (element, className) => {
    if (typeof element === 'string') element = $(element);
    if (element) element.classList.remove(className);
};

export const createElement = (tag, className = '', innerHTML = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
};

export const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};