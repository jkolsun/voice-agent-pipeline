import { ClientDemo, DemoLink } from "./types";

const STORAGE_KEY = "voice_agent_demos";
const DEMO_LINKS_KEY = "voice_agent_demo_links";

export function getClients(): ClientDemo[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getClient(id: string): ClientDemo | null {
  const clients = getClients();
  return clients.find((c) => c.id === id) || null;
}

export function saveClient(client: ClientDemo): void {
  const clients = getClients();
  const existingIndex = clients.findIndex((c) => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = {
      ...client,
      updated_at: new Date().toISOString(),
    };
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function deleteClient(id: string): void {
  const clients = getClients().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function updateClientStatus(
  id: string,
  status: ClientDemo["status"]
): ClientDemo | null {
  const client = getClient(id);
  if (!client) return null;
  
  client.status = status;
  client.updated_at = new Date().toISOString();
  
  if (status === "approved") {
    client.production_details = {
      ...client.production_details,
      approved_at: new Date().toISOString(),
    };
  }
  
  saveClient(client);
  return client;
}

export function exportClientsToJSON(): string {
  const clients = getClients();
  return JSON.stringify(clients, null, 2);
}

export function importClientsFromJSON(jsonString: string): boolean {
  try {
    const clients = JSON.parse(jsonString);
    if (!Array.isArray(clients)) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    return true;
  } catch {
    return false;
  }
}

// Demo Links Storage Functions
export function getDemoLinks(): DemoLink[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(DEMO_LINKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getDemoLink(id: string): DemoLink | null {
  const links = getDemoLinks();
  return links.find((l) => l.id === id) || null;
}

export function getDemoLinkBySlug(slug: string): DemoLink | null {
  const links = getDemoLinks();
  return links.find((l) => l.slug === slug) || null;
}

export function getDemoLinksForClient(clientId: string): DemoLink[] {
  const links = getDemoLinks();
  return links.filter((l) => l.client_id === clientId);
}

export function saveDemoLink(link: DemoLink): void {
  const links = getDemoLinks();
  const existingIndex = links.findIndex((l) => l.id === link.id);

  if (existingIndex >= 0) {
    links[existingIndex] = link;
  } else {
    links.push(link);
  }

  localStorage.setItem(DEMO_LINKS_KEY, JSON.stringify(links));
}

export function deleteDemoLink(id: string): void {
  const links = getDemoLinks().filter((l) => l.id !== id);
  localStorage.setItem(DEMO_LINKS_KEY, JSON.stringify(links));
}

export function incrementDemoLinkUsage(slug: string): void {
  const link = getDemoLinkBySlug(slug);
  if (link) {
    link.usage_count += 1;
    saveDemoLink(link);
  }
}

export function isDemoLinkValid(link: DemoLink): boolean {
  if (!link.is_active) return false;
  if (link.expires_at && new Date(link.expires_at) < new Date()) return false;
  return true;
}
