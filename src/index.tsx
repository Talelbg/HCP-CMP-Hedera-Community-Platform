import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import Tailwind directives
// Since we don't have a css file with @tailwind directives yet, and the user had cdn tailwind.
// But the user asked for standard NPM imports.
// I should create index.css with tailwind directives if I want to remove the CDN.
// For now, I will create a basic css file or rely on the CDN in index.html, but I need to be careful.
// The user said: "Tout le code source ... DOIT être dans le dossier src/".
// The user also said: "DÉPENDANCES : Utilise les imports NPM standards ... PAS les liens CDN (gstatic)".
// This implies I SHOULD setup tailwind properly.
// But I haven't installed tailwind via npm yet.
// I should verify if I can/should install tailwind.
// "Agis comme un Expert Senior React & Cloud Architect".
// I will create index.css and import it here.
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
