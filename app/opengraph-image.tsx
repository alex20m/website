import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { profile } from '@/data/personal';
import { computeAvatarCrop } from '@/lib/avatarCrop';

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const AVATAR_SIZE = 320;
const AVATAR_LEFT = 70;
const TEXT_LEFT = AVATAR_LEFT + AVATAR_SIZE + 50;

const crop = computeAvatarCrop(
  AVATAR_SIZE,
  profile.photo.width,
  profile.photo.height,
  profile.photo.focalX,
  profile.photo.focalY,
  profile.photo.zoom,
);

export default async function OpengraphImage() {
  const photoBuffer = await readFile(join(process.cwd(), 'public', profile.photo.src));
  const photoSrc = `data:image/png;base64,${photoBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', backgroundColor: '#f8f9fb' }}>
        <div
          style={{
            position: 'absolute',
            left: AVATAR_LEFT,
            top: (size.height - AVATAR_SIZE) / 2,
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            display: 'flex',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '6px solid #e3eaf6',
            boxShadow: '0 8px 24px rgba(10,25,41,0.12)',
          }}
        >
          {/* Same crop the live Avatar renders — computeAvatarCrop derives
              the equivalent numeric rect from profile.photo's focalX/focalY/
              zoom, since Satori can't apply object-fit/transform directly. */}
          <img
            src={photoSrc}
            alt={profile.name}
            width={crop.width}
            height={crop.height}
            style={{ position: 'absolute', left: crop.left, top: crop.top }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: TEXT_LEFT,
            top: 0,
            width: size.width - TEXT_LEFT - 60,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* No bio here: at the sizes platforms actually render this image
              (a phone message bubble can be under 300px wide), a full
              sentence shrinks past legible while name/title still hold up.
              The bio is still in og:description for platforms that render
              that as text. */}
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, color: '#0a1929' }}>{profile.name}</div>
          <div style={{ display: 'flex', fontSize: 42, color: '#1565c0', marginTop: 20 }}>{profile.title}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
