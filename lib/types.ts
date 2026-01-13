// Core types for Voice Agent Demo Builder

export type ClientStatus = "draft" | "demo_ready" | "approved" | "production";

export interface TransferRule {
  condition: string;
  action: string;
  phone?: string;
}

export interface ClientDemo {
  id: string;
  created_at: string;
  updated_at: string;
  status: ClientStatus;

  // Business Info
  business_name: string;
  industry: string;
  services: string[];
  service_area: string;
  website_url?: string;
  hours: {
    weekday: string;
    weekend: string;
    timezone: string;
  };

  // Website scraped data for enriched prompts
  website_data?: {
    description?: string;
    aboutUs?: string;
    tagline?: string;
    phone?: string;
    email?: string;
    address?: string;
    scrapedServices?: string[];
    rawContent?: string;
  };

  // Agent Behavior
  after_hours_goal: "lead_capture" | "voicemail" | "emergency_transfer";
  tone: "professional" | "friendly" | "casual" | "formal";
  transfer_rules: TransferRule[];
  
  // Generated Artifacts
  artifacts?: {
    demo_config?: string;
    demo_system_prompt?: string;
    client_test_instructions?: string;
    production_system_prompt?: string;
  };
  
  // Production Details (after approval)
  production_details?: {
    approved_at?: string;
    elevenlabs_voice_id?: string;
    twilio_number?: string;
    crm_integration?: string;
    calendar_integration?: string;
  };
}

export interface ClientFormData {
  business_name: string;
  industry: string;
  services: string[];
  service_area: string;
  website_url?: string;
  website_data?: ClientDemo["website_data"];
  hours: {
    weekday: string;
    weekend: string;
    timezone: string;
  };
  after_hours_goal: "lead_capture" | "voicemail" | "emergency_transfer";
  tone: "professional" | "friendly" | "casual" | "formal";
  transfer_rules: TransferRule[];
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  draft: "Draft",
  demo_ready: "Demo Ready",
  approved: "Approved",
  production: "Production",
};

export const STATUS_COLORS: Record<ClientStatus, string> = {
  draft: "bg-slate-500",
  demo_ready: "bg-amber-500",
  approved: "bg-emerald-500",
  production: "bg-brand-500",
};

export const INDUSTRY_OPTIONS = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Landscaping",
  "Cleaning Services",
  "Auto Repair",
  "Medical/Dental",
  "Legal Services",
  "Real Estate",
  "Restaurant",
  "Salon/Spa",
  "Fitness",
  "Pet Services",
  "Home Services",
  "Professional Services",
  "Retail",
  "Other",
];

export const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

// Quick create form data - minimal fields for fast demo creation
export interface QuickCreateFormData {
  business_name: string;
  industry: string;
  service_area: string;
}

// Website scraped data to enrich demos
export interface WebsiteData {
  businessName?: string;
  description?: string;
  services?: string[];
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  aboutUs?: string;
  tagline?: string;
  serviceArea?: string;
  rawContent?: string;
}

// Demo link for sharing with clients
export interface DemoLink {
  id: string;
  client_id: string;
  slug: string;
  created_at: string;
  expires_at: string | null;
  max_duration_seconds: number;
  is_active: boolean;
  usage_count: number;
  // Optional demo phone number for call-in demos
  demo_phone_number?: string;
}

// Industry defaults for auto-populating form fields
export const INDUSTRY_DEFAULTS: Record<string, Partial<ClientFormData>> = {
  "HVAC": {
    services: ["AC Repair", "Heating Service", "HVAC Maintenance", "Emergency Service", "Installation"],
    tone: "professional",
    after_hours_goal: "emergency_transfer",
    hours: { weekday: "8:00 AM - 6:00 PM", weekend: "Emergency Only", timezone: "America/New_York" }
  },
  "Plumbing": {
    services: ["Drain Cleaning", "Pipe Repair", "Water Heater", "Emergency Plumbing", "Leak Detection"],
    tone: "friendly",
    after_hours_goal: "emergency_transfer",
    hours: { weekday: "8:00 AM - 5:00 PM", weekend: "Emergency Only", timezone: "America/New_York" }
  },
  "Electrical": {
    services: ["Electrical Repair", "Panel Upgrades", "Outlet Installation", "Lighting", "Emergency Service"],
    tone: "professional",
    after_hours_goal: "emergency_transfer",
    hours: { weekday: "8:00 AM - 5:00 PM", weekend: "Emergency Only", timezone: "America/New_York" }
  },
  "Roofing": {
    services: ["Roof Repair", "Roof Replacement", "Inspections", "Gutter Service", "Storm Damage"],
    tone: "professional",
    after_hours_goal: "lead_capture",
    hours: { weekday: "7:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" }
  },
  "Landscaping": {
    services: ["Lawn Care", "Tree Service", "Landscape Design", "Irrigation", "Seasonal Cleanup"],
    tone: "friendly",
    after_hours_goal: "lead_capture",
    hours: { weekday: "7:00 AM - 6:00 PM", weekend: "8:00 AM - 2:00 PM", timezone: "America/New_York" }
  },
  "Cleaning Services": {
    services: ["House Cleaning", "Deep Cleaning", "Move-In/Out", "Office Cleaning", "Recurring Service"],
    tone: "friendly",
    after_hours_goal: "lead_capture",
    hours: { weekday: "8:00 AM - 6:00 PM", weekend: "9:00 AM - 3:00 PM", timezone: "America/New_York" }
  },
  "Auto Repair": {
    services: ["Oil Change", "Brake Service", "Engine Repair", "Diagnostics", "Tire Service"],
    tone: "friendly",
    after_hours_goal: "voicemail",
    hours: { weekday: "8:00 AM - 6:00 PM", weekend: "9:00 AM - 3:00 PM", timezone: "America/New_York" }
  },
  "Medical/Dental": {
    services: ["Appointments", "Check-ups", "Emergency Care", "Consultations", "Follow-ups"],
    tone: "professional",
    after_hours_goal: "emergency_transfer",
    hours: { weekday: "8:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" }
  },
  "Legal Services": {
    services: ["Consultations", "Case Review", "Document Preparation", "Court Representation", "Legal Advice"],
    tone: "formal",
    after_hours_goal: "voicemail",
    hours: { weekday: "9:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" }
  },
  "Real Estate": {
    services: ["Property Listings", "Buyer Consultation", "Seller Consultation", "Market Analysis", "Open Houses"],
    tone: "friendly",
    after_hours_goal: "lead_capture",
    hours: { weekday: "9:00 AM - 7:00 PM", weekend: "10:00 AM - 4:00 PM", timezone: "America/New_York" }
  },
  "Restaurant": {
    services: ["Reservations", "Takeout Orders", "Catering Inquiries", "Event Booking", "Menu Questions"],
    tone: "friendly",
    after_hours_goal: "voicemail",
    hours: { weekday: "11:00 AM - 10:00 PM", weekend: "11:00 AM - 11:00 PM", timezone: "America/New_York" }
  },
  "Salon/Spa": {
    services: ["Haircuts", "Coloring", "Spa Treatments", "Nails", "Appointments"],
    tone: "friendly",
    after_hours_goal: "lead_capture",
    hours: { weekday: "9:00 AM - 7:00 PM", weekend: "9:00 AM - 5:00 PM", timezone: "America/New_York" }
  },
  "Fitness": {
    services: ["Membership Inquiries", "Class Schedules", "Personal Training", "Tours", "Billing Questions"],
    tone: "friendly",
    after_hours_goal: "lead_capture",
    hours: { weekday: "5:00 AM - 10:00 PM", weekend: "7:00 AM - 8:00 PM", timezone: "America/New_York" }
  },
  "Pet Services": {
    services: ["Grooming", "Boarding", "Daycare", "Veterinary Appointments", "Pet Sitting"],
    tone: "friendly",
    after_hours_goal: "emergency_transfer",
    hours: { weekday: "7:00 AM - 7:00 PM", weekend: "8:00 AM - 5:00 PM", timezone: "America/New_York" }
  },
  "Home Services": {
    services: ["General Repairs", "Handyman Services", "Installations", "Maintenance", "Estimates"],
    tone: "friendly",
    after_hours_goal: "lead_capture",
    hours: { weekday: "8:00 AM - 6:00 PM", weekend: "9:00 AM - 3:00 PM", timezone: "America/New_York" }
  },
  "Professional Services": {
    services: ["Consultations", "Project Inquiries", "Quotes", "Support", "General Questions"],
    tone: "professional",
    after_hours_goal: "voicemail",
    hours: { weekday: "9:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" }
  },
  "Retail": {
    services: ["Product Inquiries", "Order Status", "Returns", "Store Hours", "Availability"],
    tone: "friendly",
    after_hours_goal: "voicemail",
    hours: { weekday: "10:00 AM - 8:00 PM", weekend: "10:00 AM - 6:00 PM", timezone: "America/New_York" }
  },
  "Other": {
    services: ["General Inquiries", "Appointments", "Information", "Support", "Callback Request"],
    tone: "professional",
    after_hours_goal: "lead_capture",
    hours: { weekday: "9:00 AM - 5:00 PM", weekend: "Closed", timezone: "America/New_York" }
  }
};
