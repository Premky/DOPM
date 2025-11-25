import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import MenuPanel from "./MenuPanel/MenuPanel";
// import ParolePanel from "./ParolePanel/ParolePanel";
// import TransferPanel from "./TransferPanel/TransferPanel";

export default function AdminPanel() {
  return (
    <div>
      <nav>
        <Link to="menus">Menus</Link>
        {/* <Link to="parole">Parole</Link>
        <Link to="transfer">Transfer</Link> */}
      </nav>

      <Routes>
        <Route path="menus/*" element={<MenuPanel />} />
        {/* <Route path="parole/*" element={<ParolePanel />} />
        <Route path="transfer/*" element={<TransferPanel />} /> */}
      </Routes>
    </div>
  );
}
