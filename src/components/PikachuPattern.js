import React, { memo } from 'react';
import { PikachuStickerBackground } from './PikachuStickerBackground';

export { PikachuStickerBackground };

/**
 * PikachuPattern Component (Delegates to PikachuStickerBackground)
 * Displays the authentic warm orange Pikachu sticker-sheet collage.
 */
export const PikachuPattern = memo(({
  opacity = 0.22,
  style,
}) => {
  return (
    <PikachuStickerBackground
      opacity={opacity}
      style={style}
    />
  );
});
