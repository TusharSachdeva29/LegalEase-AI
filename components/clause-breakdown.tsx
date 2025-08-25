"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle, Lightbulb } from "lucide-react";
import type { DocumentAnalysis } from "@/lib/gemini";

interface ClauseBreakdownProps {
  selectedFilter: string;
  analysis?: DocumentAnalysis | null;
}

const mockClauses = [
  {
    id: 1,
    title: "Contract Introduction",
    originalText:
      'This Service Agreement ("Agreement") is entered into on [DATE] between [COMPANY NAME], a [STATE] corporation ("Company"), and [CLIENT NAME] ("Client").',
    simplifiedExplanation:
      "This is the opening section that identifies who is making the agreement and when it starts. It establishes the legal relationship between the service provider (Company) and the customer (Client).",
    whatThisMeans:
      "This is standard contract language that simply identifies the parties involved. No major concerns here - it's just setting up who's who in the agreement.",
    riskLevel: "low",
    category: "Introduction",
  },
  {
    id: 2,
    title: "Service Description & Payment",
    originalText:
      'The Company shall provide the services described in Exhibit A attached hereto and incorporated herein by reference ("Services"). The Client agrees to pay the fees set forth in Exhibit B.',
    simplifiedExplanation:
      "The company will provide services that are detailed in a separate document (Exhibit A), and you agree to pay the fees listed in another document (Exhibit B).",
    whatThisMeans:
      "Be careful here - the actual services and costs aren't clearly defined in this main contract. Make sure you have and understand both Exhibit A (services) and Exhibit B (pricing) before signing.",
    riskLevel: "medium",
    category: "Services & Payment",
  },
  {
    id: 3,
    title: "Termination Clause",
    originalText:
      "Either party may terminate this Agreement at any time, with or without cause, by providing thirty (30) days written notice to the other party. Upon termination, all unpaid fees become immediately due and payable.",
    simplifiedExplanation:
      "Both you and the company can end this contract anytime with 30 days notice. However, if the contract ends, you must immediately pay any money you still owe.",
    whatThisMeans:
      "This could create cash flow problems for you. If the contract ends unexpectedly, you'll need to pay all outstanding bills right away, even if they weren't due yet. Consider negotiating for a payment plan instead.",
    riskLevel: "high",
    category: "Termination",
  },
  {
    id: 4,
    title: "Indemnification Clause",
    originalText:
      "The Client agrees to indemnify and hold harmless the Company from any and all claims, damages, losses, and expenses arising out of or relating to the Client's use of the Services.",
    simplifiedExplanation:
      "You agree to protect the company from any legal problems or costs that might arise from your use of their services. This means you'll pay for their legal defense and any damages.",
    whatThisMeans:
      "This is a very broad protection for the company at your expense. You could end up paying for lawsuits even if the company made mistakes. Try to limit this to only situations where you clearly did something wrong.",
    riskLevel: "high",
    category: "Liability",
  },
  {
    id: 5,
    title: "Governing Law",
    originalText:
      "This Agreement shall be governed by and construed in accordance with the laws of [STATE], without regard to its conflict of laws principles.",
    simplifiedExplanation:
      "If there are any legal disputes about this contract, they will be handled according to the laws of a specific state, regardless of where you or the company are located.",
    whatThisMeans:
      "This is standard language that determines which state's laws apply to your contract. Make sure you're comfortable with the legal system in that state, as you may need to resolve disputes there.",
    riskLevel: "low",
    category: "Legal Framework",
  },
  {
    id: 6,
    title: "Confidentiality Agreement",
    originalText:
      "Each party acknowledges that it may have access to certain confidential information of the other party. Each party agrees to maintain the confidentiality of such information and not to disclose it to third parties without prior written consent.",
    simplifiedExplanation:
      "Both parties agree to keep each other's private business information secret and not share it with anyone else without written permission.",
    whatThisMeans:
      "This protects both your business secrets and theirs. It's generally fair and balanced. Make sure you understand what information is considered 'confidential' so you don't accidentally violate this clause.",
    riskLevel: "low",
    category: "Confidentiality",
  },
  {
    id: 7,
    title: "Limitation of Liability",
    originalText:
      "In no event shall the Company's total liability to Client for all damages exceed the total amount paid by Client to Company under this Agreement in the twelve (12) months preceding the claim.",
    simplifiedExplanation:
      "If the company causes you damages, the maximum they'll pay you is the amount you paid them in the past 12 months.",
    whatThisMeans:
      "This limits how much you can recover if something goes wrong. If you suffer major damages that exceed what you've paid them, you won't be fully compensated. Consider if this limit is reasonable for your situation.",
    riskLevel: "medium",
    category: "Liability",
  },
  {
    id: 8,
    title: "Force Majeure",
    originalText:
      "Neither party shall be liable for any failure or delay in performance under this Agreement which is due to an act of God, war, terrorism, epidemic, government action, or other cause beyond the reasonable control of such party.",
    simplifiedExplanation:
      "If either party can't fulfill their obligations due to major events outside their control (like natural disasters, wars, or pandemics), they won't be held responsible for the delay.",
    whatThisMeans:
      "This is standard protection for both parties during extraordinary circumstances. It's generally fair, but make sure it doesn't excuse poor performance during normal business conditions.",
    riskLevel: "low",
    category: "Force Majeure",
  },
  {
    id: 9,
    title: "Intellectual Property Rights",
    originalText:
      "All intellectual property rights in any work product created by Company in the performance of the Services shall remain the exclusive property of Company, unless otherwise agreed in writing.",
    simplifiedExplanation:
      "Anything the company creates while working for you belongs to them, not you, unless you have a separate written agreement saying otherwise.",
    whatThisMeans:
      "This could be problematic if you're paying for custom work that you expect to own. You might want to negotiate for ownership of work products you're paying for, especially if they're specific to your business.",
    riskLevel: "high",
    category: "Intellectual Property",
  },
  {
    id: 10,
    title: "Payment Terms",
    originalText:
      "Client shall pay all invoices within thirty (30) days of receipt. Late payments shall incur a service charge of 1.5% per month on the outstanding balance.",
    simplifiedExplanation:
      "You must pay bills within 30 days of receiving them. If you pay late, you'll be charged an extra 1.5% per month on the unpaid amount.",
    whatThisMeans:
      "The 30-day payment term is standard, but the 1.5% monthly late fee adds up to 18% per year, which is quite high. Make sure you can meet the payment schedule to avoid these expensive late fees.",
    riskLevel: "medium",
    category: "Payment Terms",
  },
  {
    id: 11,
    title: "Dispute Resolution",
    originalText:
      "Any disputes arising under this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, and the parties waive their right to a jury trial.",
    simplifiedExplanation:
      "If you have a legal dispute, it must be resolved through arbitration (a private judge) rather than going to court, and you give up your right to a jury trial.",
    whatThisMeans:
      "Arbitration can be faster and cheaper than court, but you lose some legal protections and appeal rights. Consider whether you're comfortable giving up your right to a jury trial and court system.",
    riskLevel: "medium",
    category: "Dispute Resolution",
  },
  {
    id: 12,
    title: "Amendment Clause",
    originalText:
      "This Agreement may only be amended by a written document signed by both parties. No oral modifications shall be binding.",
    simplifiedExplanation:
      "Changes to this contract are only valid if they're written down and signed by both parties. Verbal agreements to change the contract don't count.",
    whatThisMeans:
      "This protects both parties by ensuring all changes are documented. It's good practice and prevents misunderstandings about what was agreed to. Keep records of any written amendments.",
    riskLevel: "low",
    category: "Contract Modifications",
  },
];

export function ClauseBreakdown({
  selectedFilter,
  analysis,
}: ClauseBreakdownProps) {
  // Use analysis clauses if available, otherwise show empty state
  const allClauses = analysis?.clauses || [];

  const filteredClauses = allClauses.filter((clause) => {
    if (selectedFilter === "all") return true;
    return clause.riskLevel === selectedFilter;
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-yellow-50 border-yellow-200";
      case "low":
        return "bg-green-50 border-green-200";
      default:
        return "bg-muted border-border";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "medium":
        return <Info className="h-5 w-5 text-yellow-600" />;
      case "low":
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      default:
        return null;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div>
      {filteredClauses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClauses.map((clause) => (
            <Card
              key={clause.id}
              className={`p-6 ${getRiskColor(clause.riskLevel)}`}
            >
              {/* Clause Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {clause.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {clause.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {getRiskIcon(clause.riskLevel)}
                  <Badge
                    variant={getRiskBadgeVariant(clause.riskLevel)}
                    className="text-xs"
                  >
                    {clause.riskLevel} risk
                  </Badge>
                </div>
              </div>

              {/* Original Clause */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Original Clause:
                </h4>
                <div className="p-3 bg-muted rounded border text-sm text-muted-foreground leading-relaxed">
                  "{clause.originalText}"
                </div>
              </div>

              {/* Simplified Explanation */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Simplified Explanation:
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {clause.simplifiedExplanation}
                </p>
              </div>

              {/* What This Means */}
              <div className="p-4 bg-secondary/10 rounded-lg border-l-4 border-secondary">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      What this means for you:
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {clause.whatThisMeans}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : analysis ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No clauses match the selected filter.
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Upload a document to see AI-powered clause breakdown.
          </p>
        </div>
      )}
    </div>
  );
}
