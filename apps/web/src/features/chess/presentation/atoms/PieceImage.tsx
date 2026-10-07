import type { ImgHTMLAttributes } from "react";

/** cburnett satranç taşı görseli; `code` ör. "wK", "bQ". */
export function PieceImage({ code, className = "", ...rest }: { code: string } & ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={`/assets/chess/pieces/${code}.svg`} alt={code} draggable={false} className={className} {...rest} />;
}
