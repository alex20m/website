import { describe, expect, it } from 'vitest';
import { computeAvatarCrop } from '@/lib/avatarCrop';

describe('computeAvatarCrop', () => {
  it('exactly fills the box with no offset for a same-size square source, centered, no zoom', () => {
    expect(computeAvatarCrop(200, 200, 200, 50, 50, 1)).toEqual({ left: 0, top: 0, width: 200, height: 200 });
  });

  it('top-aligns the source when focalY is 0%', () => {
    const crop = computeAvatarCrop(200, 400, 800, 50, 0, 1);
    expect(crop.top).toBe(0);
  });

  it('bottom-aligns the source when focalY is 100%', () => {
    const crop = computeAvatarCrop(200, 400, 800, 50, 100, 1);
    expect(crop.top + crop.height).toBeCloseTo(200);
  });

  it('centers the crop vertically for focalY 50%, halfway between the top and bottom alignments', () => {
    const top = computeAvatarCrop(200, 400, 800, 50, 0, 1).top;
    const bottom = computeAvatarCrop(200, 400, 800, 50, 100, 1).top;
    const center = computeAvatarCrop(200, 400, 800, 50, 50, 1).top;
    expect(center).toBeCloseTo((top + bottom) / 2);
  });

  it('preserves the source aspect ratio regardless of focal position or zoom', () => {
    const crop = computeAvatarCrop(180, 703, 940, 50, 70, 1.2);
    expect(crop.width / crop.height).toBeCloseTo(703 / 940);
  });

  it('zooming in shrinks the fraction of the box the un-zoomed crop would have shown', () => {
    // A centered, un-zoomed cover-crop of a square source exactly fills the box;
    // zooming by `z` should scale that same rect by `z` around the box center.
    const size = 200;
    const zoom = 1.5;
    const crop = computeAvatarCrop(size, size, size, 50, 50, zoom);
    expect(crop.width).toBeCloseTo(size * zoom);
    expect(crop.left).toBeCloseTo((size - size * zoom) / 2);
  });
});
