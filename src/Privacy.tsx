export default function Privacy() {
  const blue = '#1255A0';
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: blue, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#444', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: blue, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>Legal</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 4 }}>Privacy Policy</div>
        <div style={{ fontSize: 13, color: '#999' }}>Last updated: March 2026 · Fassah · fassah.com</div>
      </div>
      <Section title="1. Who We Are">
        Fassah is a community-built map that helps Muslims in the UK find somewhere to pray. We are based in the United Kingdom. If you have any questions about this policy, contact us at hello@fassah.com.
      </Section>
      <Section title="2. What Data We Collect">
        <strong>Anonymous session data:</strong> When you use Fassah we assign you a randomly generated anonymous username (e.g. "Lion_4821") stored in your browser's localStorage. This is not linked to your name, email, or any personal identity.<br /><br />
        <strong>Check-in data:</strong> When you check in to a prayer space we store your anonymous session ID, the space ID, and your answers (is it open, busy, wudu available). We do not store your GPS location.<br /><br />
        <strong>Submitted spaces:</strong> If you submit a prayer space we store the name, address, description, and photo you provide. We do not store who submitted it beyond the anonymous session ID.<br /><br />
        <strong>We do not collect:</strong> your name, email address, phone number, precise GPS location, device identifiers, or any information that identifies you personally.
      </Section>
      <Section title="3. How We Use Your Data">
        — To display prayer spaces on the map<br />
        — To show community check-in summaries (e.g. "usually open · quiet")<br />
        — To calculate and display leaderboard points<br />
        — To improve the quality and accuracy of prayer space listings<br /><br />
        We do not use your data for advertising. We do not sell your data. Ever.
      </Section>
      <Section title="4. Cookies and Local Storage">
        We use your browser's localStorage to store your anonymous session ID and points total. We do not use third-party tracking cookies. Cloudflare Turnstile (our bot protection) may set a session cookie strictly for security purposes — it does not track you across websites.
      </Section>
      <Section title="5. Third-Party Services">
        <strong>Supabase:</strong> Our database provider. Data is stored on servers in the EU. Supabase privacy policy: supabase.com/privacy<br /><br />
        <strong>Google Maps:</strong> Used to display the map. Google's privacy policy applies to map interactions: policies.google.com/privacy<br /><br />
        <strong>Cloudflare Turnstile:</strong> Used for bot protection on form submissions. Cloudflare privacy policy: cloudflare.com/privacypolicy<br /><br />
        <strong>Aladhan API:</strong> Used to fetch prayer times. No personal data is sent to this service.
      </Section>
      <Section title="6. Data Retention">
        Anonymous session data is retained indefinitely to preserve your points and check-in history. If you delete your account (via Settings → Delete Account), all data associated with your session ID is permanently deleted within 30 days.
      </Section>
      <Section title="7. Your Rights (UK GDPR)">
        As a UK resident you have the right to:<br />
        — Access the data we hold about you<br />
        — Request deletion of your data<br />
        — Object to processing<br />
        — Lodge a complaint with the ICO (ico.org.uk)<br /><br />
        Because we hold only anonymous data linked to a session ID (not your identity), we may ask you to provide your session ID to fulfil a data request. Email hello@fassah.com.
      </Section>
      <Section title="8. Children">
        Fassah is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has submitted data, contact us at hello@fassah.com and we will delete it promptly.
      </Section>
      <Section title="9. Changes to This Policy">
        We may update this policy as the app grows. The latest version will always be at fassah.com/privacy. Continued use of Fassah after changes means you accept the updated policy.
      </Section>
      <Section title="10. Contact">
        Fassah · hello@fassah.com · fassah.com<br />
        Registered in England and Wales.
      </Section>
      <div style={{ marginTop: 40, padding: '16px 20px', background: '#F0F5FF', borderRadius: 12, fontSize: 13, color: blue, textAlign: 'center' as const }}>
        بِسْمِ اللهِ · Free to use · No ads · No data sold · Built for the ummah
      </div>
    </div>
  );
}
 
