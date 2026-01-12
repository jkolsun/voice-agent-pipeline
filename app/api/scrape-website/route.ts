import { NextRequest, NextResponse } from "next/server";

export interface ScrapedWebsiteData {
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
  testimonials?: string[];
  faqs?: { question: string; answer: string }[];
  rawContent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch the website
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VoiceAgentDemo/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract data from HTML
    const data = extractWebsiteData(html, parsedUrl.hostname);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scrape website" },
      { status: 500 }
    );
  }
}

function extractWebsiteData(html: string, hostname: string): ScrapedWebsiteData {
  const data: ScrapedWebsiteData = {};

  // Remove scripts and styles to get cleaner text
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Extract title (business name)
  const titleMatch = cleanHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    // Clean up title - remove common suffixes
    data.businessName = titleMatch[1]
      .split("|")[0]
      .split("-")[0]
      .split("–")[0]
      .trim();
  }

  // Extract meta description
  const descMatch = cleanHtml.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  if (descMatch) {
    data.description = descMatch[1].trim();
  }

  // Extract Open Graph description as fallback
  if (!data.description) {
    const ogDescMatch = cleanHtml.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
    );
    if (ogDescMatch) {
      data.description = ogDescMatch[1].trim();
    }
  }

  // Extract phone numbers
  const phonePatterns = [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g,
    /tel:([^"'\s]+)/gi,
  ];

  for (const pattern of phonePatterns) {
    const matches = cleanHtml.match(pattern);
    if (matches && matches.length > 0) {
      // Clean and dedupe phone numbers
      const cleanPhone = matches[0].replace(/tel:/i, "").trim();
      if (cleanPhone.length >= 10) {
        data.phone = cleanPhone;
        break;
      }
    }
  }

  // Extract email
  const emailMatch = cleanHtml.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  if (emailMatch) {
    data.email = emailMatch[0];
  }

  // Extract address patterns
  const addressPatterns = [
    // Street address pattern
    /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[,.\s]+[\w\s]+,?\s*[A-Z]{2}\s*\d{5}/gi,
  ];

  for (const pattern of addressPatterns) {
    const matches = cleanHtml.match(pattern);
    if (matches && matches.length > 0) {
      data.address = matches[0].trim();
      break;
    }
  }

  // Try to extract service area from content
  const serviceAreaPatterns = [
    /serving\s+([^.!<]+)/i,
    /service\s+area[:\s]+([^.!<]+)/i,
    /we\s+serve\s+([^.!<]+)/i,
    /located\s+in\s+([^.!<]+)/i,
  ];

  for (const pattern of serviceAreaPatterns) {
    const match = cleanHtml.match(pattern);
    if (match) {
      data.serviceArea = match[1].trim().slice(0, 100);
      break;
    }
  }

  // Extract services - look for lists near service-related keywords
  const servicesSection = cleanHtml.match(
    /services?[^<]*<[^>]*>[\s\S]{0,2000}?(?:<\/ul>|<\/div>|<\/section>)/i
  );

  if (servicesSection) {
    const listItems = servicesSection[0].match(/<li[^>]*>([^<]+)<\/li>/gi);
    if (listItems) {
      data.services = listItems
        .map((item) => item.replace(/<[^>]+>/g, "").trim())
        .filter((s) => s.length > 2 && s.length < 100)
        .slice(0, 10);
    }
  }

  // Fallback: look for h2/h3 headings that might be services
  if (!data.services || data.services.length === 0) {
    const headings = cleanHtml.match(/<h[23][^>]*>([^<]+)<\/h[23]>/gi);
    if (headings) {
      const potentialServices = headings
        .map((h) => h.replace(/<[^>]+>/g, "").trim())
        .filter(
          (s) =>
            s.length > 3 &&
            s.length < 60 &&
            !s.toLowerCase().includes("contact") &&
            !s.toLowerCase().includes("about") &&
            !s.toLowerCase().includes("home") &&
            !s.toLowerCase().includes("blog") &&
            !s.toLowerCase().includes("news")
        )
        .slice(0, 8);

      if (potentialServices.length > 0) {
        data.services = potentialServices;
      }
    }
  }

  // Extract about us content
  const aboutSection = cleanHtml.match(
    /(?:about\s*us|who\s*we\s*are|our\s*story)[^<]*<[^>]*>([\s\S]{0,1000}?)<\/(?:div|section|p)/i
  );
  if (aboutSection) {
    const aboutText = aboutSection[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (aboutText.length > 20) {
      data.aboutUs = aboutText.slice(0, 500);
    }
  }

  // Extract tagline from h1 or hero section
  const h1Match = cleanHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    const tagline = h1Match[1].trim();
    if (tagline.length > 5 && tagline.length < 150) {
      data.tagline = tagline;
    }
  }

  // Extract hours if present
  const hoursPatterns = [
    /(?:hours|open)[:\s]*([^<]+(?:am|pm|AM|PM)[^<]*)/i,
    /(?:monday|mon)[^<]*(?:am|pm|AM|PM)[^<]*/i,
  ];

  for (const pattern of hoursPatterns) {
    const match = cleanHtml.match(pattern);
    if (match) {
      data.hours = match[0].replace(/<[^>]+>/g, " ").trim().slice(0, 200);
      break;
    }
  }

  // Get raw text content for AI processing (limited)
  const textContent = cleanHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);

  data.rawContent = textContent;

  return data;
}
