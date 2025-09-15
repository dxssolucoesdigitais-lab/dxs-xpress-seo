import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import './lib/i18n'; // Import i18n configuration

createRoot(document.getElementById("root")!).render(
  <React.Suspense fallback="loading...">
    <App />
  </React.Suspense>
);