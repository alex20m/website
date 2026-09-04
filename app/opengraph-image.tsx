import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { profile } from '@/data/personal';

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PHOTO_PANEL_WIDTH = size.width * 0.38;
const PHOTO_INSET = 0.82; // fraction of the panel the photo may occupy

// Satori's `object-fit` support on raster <img> is unreliable, so the
// contained size is computed here instead and applied as an explicit
// width/height — that's what actually keeps the whole photo visible,
// centered, and at its native proportions (no cropping, no stretching).
const photoAspect = profile.photo.width / profile.photo.height;
const maxPhotoWidth = PHOTO_PANEL_WIDTH * PHOTO_INSET;
const maxPhotoHeight = size.height * PHOTO_INSET;
let photoWidth = maxPhotoWidth;
let photoHeight = photoWidth / photoAspect;
if (photoHeight > maxPhotoHeight) {
  photoHeight = maxPhotoHeight;
  photoWidth = photoHeight * photoAspect;
}

export default async function OpengraphImage() {
  const photoBuffer = await readFile(join(process.cwd(), 'public', profile.photo.src));
  const photoSrc = `data:image/png;base64,${photoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: '#f8f9fb' }}>
        <div
          style={{
            width: PHOTO_PANEL_WIDTH,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a1929',
          }}
        >
          <img src={photoSrc} alt={profile.name} width={photoWidth} height={photoHeight} />
        </div>
        <div
          style={{
            width: size.width - PHOTO_PANEL_WIDTH,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 60px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 60, fontWeight: 700, color: '#0a1929' }}>{profile.name}</div>
          <div style={{ display: 'flex', fontSize: 30, color: '#1565c0', marginTop: 14 }}>{profile.title}</div>
          <div style={{ display: 'flex', fontSize: 24, color: '#4a5568', marginTop: 26, lineHeight: 1.5 }}>
            {profile.bio}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
