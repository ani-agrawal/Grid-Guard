import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set dark mode as default
if (!localStorage.getItem('theme')) {
  localStorage.setItem('theme', 'dark');
}
if (localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
