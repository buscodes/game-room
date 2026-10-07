/**
 * Satranç modülünün dışarıya açık arayüzü. Diğer modüller ve uygulama kökü yalnızca buradan import eder.
 */
export { CHESS_PATH } from "./presentation/route";
export { ChessPage } from "./presentation/pages/ChessPage";
export { ChessLobbyCard } from "./presentation/organisms/ChessLobbyCard";
export { ChessApiDep, type ChessApi } from "./application/ports";
export { httpChessApi } from "./infrastructure/http-chess-api";
