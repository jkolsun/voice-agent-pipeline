# Voice Agent Demo Builder

A Next.js application for creating and managing voice agent demos for clients. Built with TypeScript, Tailwind CSS, and local storage.

## Features

- **Client Demo Management**: Create, edit, and manage demo configurations for multiple clients
- **Automated Artifact Generation**: Generate demo configs, system prompts, and test instructions
- **Status Workflow**: Track clients through Draft → Demo Ready → Approved → Production
- **Production Checklist**: Complete setup checklist for ElevenLabs, Twilio, CRM, and Calendar integrations
- **Export/Import**: Export all clients as JSON or download individual client packs as ZIP files

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
voice-agent-demo-builder/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard home
│   ├── globals.css         # Global styles
│   └── clients/
│       ├── page.tsx        # Client listing
│       ├── new/
│       │   └── page.tsx    # New client form
│       └── [id]/
│           └── page.tsx    # Client detail view
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── ClientForm.tsx      # Client data form
│   ├── ArtifactViewer.tsx  # View generated artifacts
│   ├── StatusBadge.tsx     # Status indicator
│   ├── ProductionChecklist.tsx  # Production setup checklist
│   └── CopyButton.tsx      # Copy to clipboard
├── lib/
│   ├── types.ts            # TypeScript types
│   ├── storage.ts          # localStorage utilities
│   ├── templates.ts        # Artifact templates
│   └── generators.ts       # Artifact generators
└── package.json
```

## Workflow

### 1. Create Demo
- Fill in business information (name, industry, services, hours)
- Configure agent behavior (tone, after-hours goal, transfer rules)
- System automatically generates demo artifacts

### 2. Review Demo
- View generated system prompt, config JSON, and test instructions
- Edit and regenerate as needed
- Share test instructions with client

### 3. Approve Demo
- Client tests the demo agent
- Mark as "Approved" when ready for production

### 4. Production Setup
- Complete the production checklist:
  - ElevenLabs voice setup
  - Twilio phone configuration
  - CRM integration
  - Calendar integration
  - SMS/Email follow-up
- Mark as "Production" when live

## Key Concepts

### Demo vs Production

**Demo Agents:**
- Use standard voice
- Use temporary phone numbers
- Simulate bookings (no real calendar)
- Never mention pricing
- Collect lead information only

**Production Agents:**
- Use ElevenLabs custom voice
- Use client's real phone number
- Integrate with real calendar/CRM
- Full booking capability
- SMS/email follow-up

### Status Workflow

| Status | Description |
|--------|-------------|
| Draft | Initial creation, not yet ready |
| Demo Ready | Artifacts generated, ready for testing |
| Approved | Client has approved the demo |
| Production | Live and handling real calls |

## Configuration

All business-specific information is stored in JSON configuration. The agent logic remains constant across all clients.

### Configurable Fields

- Business name, industry, service area
- Services offered
- Hours of operation
- After-hours goal (lead capture, voicemail, emergency transfer)
- Voice tone (professional, friendly, casual, formal)
- Transfer rules (condition → action)

## Data Storage

This application uses browser localStorage for data persistence. To back up or transfer data:

1. Use "Export All" to download a JSON file of all clients
2. Use "Import" to restore from a JSON file
3. Use "Export ZIP" on individual clients to download all artifacts

## Technologies

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [JSZip](https://stuk.github.io/jszip/) - ZIP file generation
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - File downloads

## License

Private - Internal use only
