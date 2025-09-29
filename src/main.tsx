
import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import ClerkAppRouter from "./ClerkAppRouter.tsx";
import "./index.css";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local file");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <ClerkAppRouter />
  </ClerkProvider>
);
  