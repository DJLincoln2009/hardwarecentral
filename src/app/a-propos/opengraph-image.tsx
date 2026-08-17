import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/lib/site-config';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${SITE_CONFIG.companyName} — À propos`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: '64px 72px',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                width: '14px',
                height: '14px',
                backgroundColor: '#0F6E56',
                borderRadius: '9999px',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: '28px',
                fontWeight: 700,
                color: '#2C2C2A',
              }}
            >
              {SITE_CONFIG.companyName}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '1000px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '30px',
                fontWeight: 600,
                color: '#0F6E56',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '16px',
              }}
            >
              À propos
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '60px',
                fontWeight: 700,
                color: '#2C2C2A',
                lineHeight: 1.1,
                marginBottom: '24px',
              }}
            >
              Votre partenaire IT au Cameroun
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '26px',
                fontWeight: 600,
                color: '#5F5E5A',
              }}
            >
              {SITE_CONFIG.legalName} &middot; Douala, Cameroun
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '8px',
              backgroundColor: '#0F6E56',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
