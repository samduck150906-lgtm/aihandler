

function Footer() {
  return (
    <footer style={{ padding: '24px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6', color: '#6b7280', fontSize: '12px', lineHeight: '1.6', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', fontWeight: 'bold' }}>
          <a href="/terms.html" style={{ color: '#374151', textDecoration: 'none' }}>이용약관</a>
          <a href="/privacy.html" style={{ color: '#374151', textDecoration: 'none' }}>개인정보처리방침</a>
          <a href="/refund.html" style={{ color: '#374151', textDecoration: 'none' }}>취소 및 환불 안내</a>
        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#6b7280' }}>
            <span>Copyright © 2026 AI Handler. All rights reserved.</span>
          </div>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
export default Footer;
