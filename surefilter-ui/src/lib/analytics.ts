'use client';

export { sendGAEvent } from '@next/third-parties/google';

/**
 * Track popup/modal open event
 */
export function trackPopupOpen(popupName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'popup_open', { popup_name: popupName });
  }
}

/**
 * Track form submission event
 */
export function trackFormSubmit(formName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'form_submit', { form_name: formName });
  }
}

/**
 * Track button click event
 */
export function trackButtonClick(buttonName: string, url?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'button_click', { button_name: buttonName, link_url: url });
  }
}

/**
 * Track generic custom event
 */
export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
