
// Define the default voices we have available
export const VOICES = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", accent: "American" },
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", accent: "American" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", accent: "American" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", accent: "American" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", accent: "British" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", accent: "American" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", accent: "British" },
];

// These are the models available from ElevenLabs
export const MODELS = [
  { id: "eleven_multilingual_v2", name: "Multilingual v2", description: "High quality, 29 languages" },
  { id: "eleven_turbo_v2_5", name: "Turbo v2.5", description: "Fast, 32 languages" },
  { id: "eleven_english_sts_v2", name: "English STS v2", description: "Speech-to-speech, English" },
];

// Pre-defined capability options
export const CAPABILITY_OPTIONS = [
  "Customer Support", 
  "Sales", 
  "Knowledge Base", 
  "Scheduling", 
  "Reminders", 
  "Product Info", 
  "CRM Integration",
  "Health", 
  "Ticketing", 
  "Onboarding"
];
