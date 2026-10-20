import { defineConfig } from "eslint/config";
import nextCore from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([...nextCore, ...nextTypescript]);
