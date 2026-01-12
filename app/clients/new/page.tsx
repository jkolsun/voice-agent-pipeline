"use client";

import { useRouter } from "next/navigation";
import ClientForm from "@/components/ClientForm";
import { ClientFormData } from "@/lib/types";
import { createNewClient, generateDemoArtifacts } from "@/lib/generators";
import { saveClient } from "@/lib/storage";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = (data: ClientFormData) => {
    // Create new client
    const client = createNewClient(data);
    
    // Generate demo artifacts
    const clientWithArtifacts = generateDemoArtifacts(client);
    
    // Save to localStorage
    saveClient(clientWithArtifacts);
    
    // Dispatch event to update sidebar
    window.dispatchEvent(new Event("clientsUpdated"));
    
    // Navigate to client detail page
    router.push(`/clients/${clientWithArtifacts.id}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Create New Client Demo</h1>
        <p className="text-slate-400 mt-1">
          Fill in the business details to generate a demo voice agent configuration
        </p>
      </div>

      {/* Form */}
      <ClientForm
        onSubmit={handleSubmit}
        onCancel={() => router.push("/")}
        submitLabel="Create & Generate Demo"
      />
    </div>
  );
}
