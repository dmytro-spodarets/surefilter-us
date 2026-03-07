'use client';

import { useEffect, useMemo, useRef } from 'react';

const SCRIPT_SRC_BASE = 'https://app.termly.io';

interface TermlyCMPProps {
  websiteUUID: string;
  autoBlock?: boolean;
  masterConsentsOrigin?: string;
}

export default function TermlyCMP({ autoBlock, masterConsentsOrigin, websiteUUID }: TermlyCMPProps) {
  const scriptSrc = useMemo(() => {
    const src = new URL(SCRIPT_SRC_BASE);
    src.pathname = `/resource-blocker/${websiteUUID}`;
    if (autoBlock) {
      src.searchParams.set('autoBlock', 'on');
    }
    if (masterConsentsOrigin) {
      src.searchParams.set('masterConsentsOrigin', masterConsentsOrigin);
    }
    return src.toString();
  }, [autoBlock, masterConsentsOrigin, websiteUUID]);

  const isScriptAdded = useRef(false);

  useEffect(() => {
    if (isScriptAdded.current || typeof window === 'undefined') return;

    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      isScriptAdded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    document.head.appendChild(script);
    isScriptAdded.current = true;
  }, [scriptSrc]);

  return null;
}
