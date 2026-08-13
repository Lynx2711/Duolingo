// src/app/learn/page.tsx — Redirect/Alias Route for /learn -> /path
//
// In Duolingo, the primary learning route is /learn.
// This route re-exports the PathPage component so both /learn and /path work identically.

import PathPage from "../path/page";

export default PathPage;
