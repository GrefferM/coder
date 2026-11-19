import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { App } from "./App";
import { WidgetPage } from "./pages";
import { WIDGET_BODY_CLASS, WIDGET_HASH } from "./constants";
import "./app.scss";

const isWidget = window.location.hash === WIDGET_HASH;

// The widget's window lays its own frame; the main window's padding and dotted ground are not its.
document.body.classList.toggle(WIDGET_BODY_CLASS, isWidget);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>{isWidget ? <WidgetPage /> : <App />}</StrictMode>,
);
