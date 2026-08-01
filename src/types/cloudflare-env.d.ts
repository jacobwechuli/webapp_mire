/** Worker secrets and bindings not represented in wrangler.jsonc.
 * Secrets are declared here for type safety but are configured outside source control.
 */
interface CloudflareEnv {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  GOOGLE_GENAI_API_KEY?: string;
}
