import Ajv, { ValidateFunction } from "ajv";

let cachedValidator: ValidateFunction | null = null;
let schemaVersion: string | null = null;

// Get API base URL from environment or default
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, use current origin if no env var
    return import.meta.env.VITE_API_URL || window.location.origin;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export async function getUamValidator() {
  if (cachedValidator) return { validator: cachedValidator, version: schemaVersion };
  
  const apiBaseUrl = getApiBaseUrl();
  const res = await fetch(`${apiBaseUrl}/api/uam/schema`);
  if (!res.ok) throw new Error(`Failed to load UAM schema: ${res.status}`);
  
  const data = await res.json();
  const ajv = new Ajv({ allErrors: true, strict: false });
  cachedValidator = ajv.compile(data.schema);
  schemaVersion = data.version;
  return { validator: cachedValidator, version: schemaVersion };
}

export async function validateUamAgent(doc: unknown) {
  const { validator } = await getUamValidator();
  const valid = validator(doc);
  return { valid, errors: validator.errors };
}