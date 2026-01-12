import { ClientDemo, ClientFormData, QuickCreateFormData, INDUSTRY_DEFAULTS } from "./types";
import {
  generateDemoSystemPrompt,
  generateProductionSystemPrompt,
  generateClientTestInstructions,
  generateDemoConfig,
} from "./templates";
import { v4 as uuidv4 } from "uuid";

export function createNewClient(formData: ClientFormData): ClientDemo {
  const now = new Date().toISOString();

  const client: ClientDemo = {
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    status: "draft",
    ...formData,
    artifacts: {},
  };

  return client;
}

export function generateDemoArtifacts(client: ClientDemo): ClientDemo {
  const artifacts = {
    demo_config: generateDemoConfig(client),
    demo_system_prompt: generateDemoSystemPrompt(client),
    client_test_instructions: generateClientTestInstructions(client),
  };

  return {
    ...client,
    artifacts: {
      ...client.artifacts,
      ...artifacts,
    },
    status: "demo_ready",
    updated_at: new Date().toISOString(),
  };
}

export function generateProductionArtifacts(client: ClientDemo): ClientDemo {
  if (client.status !== "approved" && client.status !== "production") {
    throw new Error("Client must be approved before generating production artifacts");
  }

  const productionPrompt = generateProductionSystemPrompt(client);

  return {
    ...client,
    artifacts: {
      ...client.artifacts,
      production_system_prompt: productionPrompt,
    },
    updated_at: new Date().toISOString(),
  };
}

export function approveClient(client: ClientDemo): ClientDemo {
  return {
    ...client,
    status: "approved",
    updated_at: new Date().toISOString(),
    production_details: {
      ...client.production_details,
      approved_at: new Date().toISOString(),
    },
  };
}

export function promoteToProduction(client: ClientDemo): ClientDemo {
  if (client.status !== "approved") {
    throw new Error("Client must be approved before promoting to production");
  }

  const withProductionArtifacts = generateProductionArtifacts(client);

  return {
    ...withProductionArtifacts,
    status: "production",
    updated_at: new Date().toISOString(),
  };
}

// Quick create function that uses industry defaults
export function createQuickClient(quickData: QuickCreateFormData): ClientDemo {
  const now = new Date().toISOString();
  const defaults = INDUSTRY_DEFAULTS[quickData.industry] || INDUSTRY_DEFAULTS["Other"];

  const client: ClientDemo = {
    id: uuidv4(),
    created_at: now,
    updated_at: now,
    status: "draft",
    business_name: quickData.business_name,
    industry: quickData.industry,
    service_area: quickData.service_area,
    services: defaults.services || [],
    tone: defaults.tone || "professional",
    after_hours_goal: defaults.after_hours_goal || "lead_capture",
    hours: defaults.hours || { weekday: "9:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" },
    transfer_rules: [],
    artifacts: {},
  };

  // Immediately generate demo artifacts for quick creation flow
  return generateDemoArtifacts(client);
}

// Publish to production with ElevenLabs details
export function publishToProduction(
  client: ClientDemo,
  elevenlabsVoiceId: string,
  twilioNumber?: string
): ClientDemo {
  if (client.status !== "approved") {
    throw new Error("Client must be approved before publishing to production");
  }

  const withProductionArtifacts = generateProductionArtifacts(client);

  return {
    ...withProductionArtifacts,
    status: "production",
    updated_at: new Date().toISOString(),
    production_details: {
      ...withProductionArtifacts.production_details,
      elevenlabs_voice_id: elevenlabsVoiceId,
      twilio_number: twilioNumber,
    },
  };
}
