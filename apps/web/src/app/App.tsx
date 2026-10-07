import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "../features/home";
import { CHESS_PATH, ChessPage } from "../features/chess";
import { PISTI_PATH, PistiPage } from "../features/pisti";
import { PIS7_PATH, Pis7Page } from "../features/pis7";
import { AppProviders } from "./providers";

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path={CHESS_PATH} element={<ChessPage />} />
          <Route path={PISTI_PATH} element={<PistiPage />} />
          <Route path={PIS7_PATH} element={<Pis7Page />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
