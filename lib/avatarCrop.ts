export interface AvatarCrop {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Numerically reproduces what a browser renders for
 * `object-fit: cover; object-position: <focalX>% <focalY>%; transform: scale(zoom)`
 * inside a `size` x `size` box, as the rect (relative to that box) the
 * source image should be drawn at. Exists because non-CSS renderers (Satori,
 * used by app/opengraph-image.tsx) can't apply those properties directly, so
 * they need the same crop expressed as plain numbers instead.
 */
export function computeAvatarCrop(
  size: number,
  sourceWidth: number,
  sourceHeight: number,
  focalX: number,
  focalY: number,
  zoom: number,
): AvatarCrop {
  const coverScale = Math.max(size / sourceWidth, size / sourceHeight);
  const coverWidth = sourceWidth * coverScale;
  const coverHeight = sourceHeight * coverScale;

  const offsetX = (size - coverWidth) * (focalX / 100);
  const offsetY = (size - coverHeight) * (focalY / 100);

  const center = size / 2;
  return {
    left: center + zoom * (offsetX - center),
    top: center + zoom * (offsetY - center),
    width: coverWidth * zoom,
    height: coverHeight * zoom,
  };
}
