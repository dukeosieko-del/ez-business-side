'use client';

export function AffiliateLink({ link }: { link: string }) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input value={link} readOnly style={{ padding: '8px', width: '300px' }} />
      <button onClick={copyLink}>Copy</button>
    </div>
  );
}