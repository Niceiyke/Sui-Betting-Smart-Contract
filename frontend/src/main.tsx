import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "@mysten/dapp-kit/dist/index.css";
import {SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";

// Configuration for different networks
const networks = {
  devnet: { url: getFullnodeUrl("devnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

// Initialize QueryClient
const queryClient = new QueryClient();

// Main App Wrapper Component
const AppWrapper: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider autoConnect storage={localStorage}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

// Render the application
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  );
} else {
  console.error("Root element not found");
}
