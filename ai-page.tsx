import { Sparkles, FileText, Mail, BarChart3, Search, Tag } from 'lucide-react';
import { Topbar } from './topbar';

const features = [
  { icon: FileText, title: 'Luxury Listings', body: 'Generate cinematic listing descriptions.' },
  { icon: Tag, title: 'Social Captions', body: 'Instagram-ready captions and hashtags.' },
  { icon: Search, title: 'SEO Descriptions', body: 'Search-friendly meta descriptions.' },
  { icon: Mail, title: 'Email Templates', body: 'Draft delivery emails and follow-ups.' },
  { icon: BarChart3, title: 'Finance Insights', body: 'Summarize revenue trends.' },
  { icon: Sparkles, title: 'Smart Search', body: 'Find clients and properties via chat.' },
];

export function AIPage() {
  return (
    <div>
      <Topbar title="AI Assistant" subtitle="Powered by Google Gemini" showSearch={false}
        actions={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(196,167,102,0.12)', border: '1px solid rgba(196,167,102,0.3)', color: '#c4a766', fontSize: 12 }}><Sparkles size={12} /> Gemini Live</span>} />
      <div className="card" style={{ marginBottom: 22 }}>
        <p className="statLabel">Try asking</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Write a luxury listing description','Generate an Instagram caption','Show top paying clients','Summarize monthly revenue','Find all unpaid galleries'].map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
        <p style={{ marginTop: 16, color: 'rgba(245,243,239,0.55)', fontSize: 13 }}>Tap the sparkle in the bottom-right to chat.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {features.map((f) => (
          <div key={f.title} className="card">
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,rgba(196,167,102,0.25),rgba(196,167,102,0.05))', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <f.icon size={18} color="#c4a766" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>{f.title}</h3>
            <p style={{ margin: 0, color: 'rgba(245,243,239,0.6)', fontSize: 13, lineHeight: 1.55 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
