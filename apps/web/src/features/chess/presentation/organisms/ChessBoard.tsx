import { useMemo } from "react";
import { Chessboard, type PieceDropHandlerArgs, type SquareHandlerArgs } from "react-chessboard";
import type { Chess, Square } from "chess.js";
import type { CSSProperties } from "react";

const PIECE_CODES = ["wK", "wQ", "wR", "wB", "wN", "wP", "bK", "bQ", "bR", "bB", "bN", "bP"];

/** cburnett Staunton taş görselleri. */
const pieces = Object.fromEntries(
  PIECE_CODES.map((code) => [
    code,
    () => (
      <img
        src={`/assets/chess/pieces/${code}.svg`}
        alt={code}
        draggable={false}
        style={{ width: "100%", height: "100%", filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.45))" }}
      />
    ),
  ]),
);

const transparent: CSSProperties = { backgroundColor: "transparent" };
const notation: CSSProperties = { fontWeight: 700, fontSize: "11px", opacity: 0.8 };

export interface ChessBoardProps {
  fen: string;
  orientation: "white" | "black";
  position: Chess;
  lastMove: { from: string; to: string } | null;
  selected: string | null;
  canDrag: boolean;
  onDrop: (from: string, to: string) => boolean;
  onSquareClick: (square: string) => void;
}

/** Son hamle, seçili taş, yasal hedef kareler ve şah tehdidi için kare stilleri. */
function useSquareStyles(position: Chess, lastMove: ChessBoardProps["lastMove"], selected: string | null) {
  return useMemo(() => {
    const s: Record<string, CSSProperties> = {};
    if (lastMove) {
      s[lastMove.from] = { background: "rgba(255, 214, 90, 0.38)" };
      s[lastMove.to] = { background: "rgba(255, 214, 90, 0.5)" };
    }
    if (selected) {
      s[selected] = { background: "rgba(120, 200, 120, 0.55)" };
      for (const m of position.moves({ square: selected as Square, verbose: true })) {
        s[m.to] = {
          ...s[m.to],
          backgroundImage: m.captured
            ? "radial-gradient(transparent 58%, rgba(20,60,20,0.55) 60%)"
            : "radial-gradient(rgba(20,60,20,0.5) 20%, transparent 22%)",
          cursor: "pointer",
        };
      }
    }
    if (position.isCheck()) {
      const king = position
        .board()
        .flat()
        .find((p) => p && p.type === "k" && p.color === position.turn());
      if (king)
        s[king.square] = {
          ...s[king.square],
          background: "radial-gradient(rgba(255,40,40,0.85), rgba(255,40,40,0) 75%)",
        };
    }
    return s;
  }, [position, lastMove, selected]);
}

/** Ahşap tahta görseli üzerinde react-chessboard. */
export function ChessBoard({
  fen,
  orientation,
  position,
  lastMove,
  selected,
  canDrag,
  onDrop,
  onSquareClick,
}: ChessBoardProps) {
  const squareStyles = useSquareStyles(position, lastMove, selected);
  const options = useMemo(
    () => ({
      id: "game-board",
      position: fen,
      boardOrientation: orientation,
      pieces,
      squareStyles,
      allowDragging: canDrag,
      animationDurationInMs: 280,
      boardStyle: {
        backgroundImage: "url(/assets/chess/board/board.jpg)",
        backgroundSize: "100% 100%",
        borderRadius: "2px",
        boxShadow: "0 0 0 2px rgba(40,20,5,0.8)",
      },
      lightSquareStyle: transparent,
      darkSquareStyle: transparent,
      lightSquareNotationStyle: { ...notation, color: "#6b4a2b" },
      darkSquareNotationStyle: { ...notation, color: "#f1dfbf" },
      dropSquareStyle: { boxShadow: "inset 0 0 0 4px rgba(255, 214, 102, 0.8)" },
      onPieceDrop: ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) =>
        targetSquare ? onDrop(sourceSquare, targetSquare) : false,
      onSquareClick: ({ square }: SquareHandlerArgs) => onSquareClick(square),
    }),
    [fen, orientation, squareStyles, canDrag, onDrop, onSquareClick],
  );
  return <Chessboard options={options} />;
}
