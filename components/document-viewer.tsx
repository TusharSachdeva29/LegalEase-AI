"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCw, AlertTriangle, Info } from "lucide-react"

interface DocumentViewerProps {
  selectedClause: number | null
  onClauseSelect: (clauseId: number | null) => void
}

const mockClauses = [
  {
    id: 1,
    text: 'This Service Agreement ("Agreement") is entered into on [DATE] between [COMPANY NAME], a [STATE] corporation ("Company"), and [CLIENT NAME] ("Client").',
    riskLevel: "low",
    type: "introduction",
  },
  {
    id: 2,
    text: 'The Company shall provide the services described in Exhibit A attached hereto and incorporated herein by reference ("Services"). The Client agrees to pay the fees set forth in Exhibit B.',
    riskLevel: "medium",
    type: "services",
  },
  {
    id: 3,
    text: "Either party may terminate this Agreement at any time, with or without cause, by providing thirty (30) days written notice to the other party. Upon termination, all unpaid fees become immediately due and payable.",
    riskLevel: "high",
    type: "termination",
  },
  {
    id: 4,
    text: "The Client agrees to indemnify and hold harmless the Company from any and all claims, damages, losses, and expenses arising out of or relating to the Client's use of the Services.",
    riskLevel: "high",
    type: "liability",
  },
  {
    id: 5,
    text: "This Agreement shall be governed by and construed in accordance with the laws of [STATE], without regard to its conflict of laws principles.",
    riskLevel: "low",
    type: "governing_law",
  },
]

export function DocumentViewer({ selectedClause, onClauseSelect }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-destructive/10 border-destructive/20"
      case "medium":
        return "bg-yellow-50 border-yellow-200"
      case "low":
        return "bg-secondary/10 border-secondary/20"
      default:
        return "bg-muted border-border"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />
      case "low":
        return <Info className="h-4 w-4 text-secondary" />
      default:
        return null
    }
  }

  return (
    <Card className="h-fit">
      {/* Document Viewer Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Original Document</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        <div style={{ fontSize: `${zoom}%` }} className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">SERVICE AGREEMENT</h1>
            <p className="text-muted-foreground">Contract No. SA-2024-001</p>
          </div>

          {mockClauses.map((clause) => (
            <div
              key={clause.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedClause === clause.id ? "border-secondary bg-secondary/5" : getRiskColor(clause.riskLevel)
              } hover:shadow-md`}
              onClick={() => onClauseSelect(selectedClause === clause.id ? null : clause.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  Clause {clause.id}
                </Badge>
                <div className="flex items-center space-x-1">
                  {getRiskIcon(clause.riskLevel)}
                  <Badge variant={clause.riskLevel === "high" ? "destructive" : "secondary"} className="text-xs">
                    {clause.riskLevel} risk
                  </Badge>
                </div>
              </div>
              <p className="text-foreground leading-relaxed">{clause.text}</p>
              {selectedClause === clause.id && (
                <div className="mt-3 p-3 bg-secondary/10 rounded border-l-4 border-secondary">
                  <p className="text-sm text-muted-foreground">Click to view AI analysis in the insights panel →</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
