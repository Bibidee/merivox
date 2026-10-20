import { defineConfig } from "eslint/config";
import nextCore from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
// Merivox intentionally hydrates wallet and chain state from browser-only APIs
// inside effects; these React compiler diagnostics are not applicable to those
// external synchronization boundaries.
export default defineConfig([
  ...nextCore,
  ...nextTypescript,
  { rules: { 'react-hooks/set-state-in-effect': 'off', 'react-hooks/purity': 'off' } },
]);
