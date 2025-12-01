"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, name: "Company & Consent" },
  { id: 2, name: "Goals & Offering" },
  { id: 3, name: "Market Definition" },
  { id: 4, name: "Brand & Audience" },
  { id: 5, name: "Documents" },
]

export function GTMSetupTab() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[100px]",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("mx-4 h-0.5 w-16 lg:w-24", currentStep > step.id ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep === 1 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input placeholder="Enter company name" defaultValue="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input placeholder="https://example.com" defaultValue="https://acmecorp.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Company Description</Label>
                    <Textarea
                      placeholder="Describe your company..."
                      rows={3}
                      defaultValue="Acme Corp is a leading provider of enterprise software solutions..."
                    />
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Data & Privacy Consents</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Allow AI data analysis</p>
                        <p className="text-xs text-muted-foreground">
                          Enable AI to analyze your company data for recommendations
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Share anonymized benchmarks</p>
                        <p className="text-xs text-muted-foreground">Contribute to industry benchmark data</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Primary Business Objective</Label>
                    <Select defaultValue="growth">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="growth">Revenue Growth</SelectItem>
                        <SelectItem value="market-share">Market Share Expansion</SelectItem>
                        <SelectItem value="efficiency">Operational Efficiency</SelectItem>
                        <SelectItem value="retention">Customer Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>GTM Goal</Label>
                    <Select defaultValue="pipeline">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Generate Market Awareness</SelectItem>
                        <SelectItem value="pipeline">Accelerate Pipeline</SelectItem>
                        <SelectItem value="revenue">Drive Revenue Growth</SelectItem>
                        <SelectItem value="expansion">Customer Expansion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Offering</Label>
                    <Textarea
                      placeholder="Describe your primary product or service..."
                      rows={3}
                      defaultValue="Enterprise CRM platform with AI-powered sales automation..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Key Differentiators</Label>
                    <Textarea
                      placeholder="What makes your offering unique?"
                      rows={2}
                      defaultValue="Native AI integration, industry-leading automation, 24/7 support"
                    />
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Target Industries</Label>
                      <Select defaultValue="technology">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="financial">Financial Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Geography</Label>
                      <Select defaultValue="north-america">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-america">North America</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="apac">APAC</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Select defaultValue="mid-market">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smb">SMB (1-100)</SelectItem>
                          <SelectItem value="mid-market">Mid-Market (101-1000)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Departments</Label>
                      <Select defaultValue="sales">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label>Brand Voice</Label>
                    <Select defaultValue="professional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional & Authoritative</SelectItem>
                        <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                        <SelectItem value="innovative">Innovative & Bold</SelectItem>
                        <SelectItem value="technical">Technical & Precise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Key Buyer Personas</Label>
                    <Textarea
                      placeholder="Describe your ideal buyer personas..."
                      rows={3}
                      defaultValue="VP of Sales seeking automation, CRO focused on pipeline efficiency, RevOps leaders managing tech stack..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Common Objections / Barriers</Label>
                    <Textarea
                      placeholder="What barriers do prospects typically face?"
                      rows={2}
                      defaultValue="Budget constraints, integration concerns, change management..."
                    />
                  </div>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <div className="space-y-4">
                    <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop documents here, or click to browse
                      </p>
                      <Button variant="outline" size="sm">
                        Browse Files
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Types</Label>
                      <p className="text-xs text-muted-foreground">
                        Upload pitch decks, case studies, product docs, or market research
                      </p>
                    </div>
                    <div className="rounded-lg bg-accent/50 p-4">
                      <h4 className="text-sm font-medium mb-2">Uploaded Documents</h4>
                      <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* GTM Brief Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">GTM Brief Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="font-medium">Acme Corp</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Primary Objective</p>
                <p className="font-medium">Revenue Growth</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GTM Goal</p>
                <p className="font-medium">Accelerate Pipeline</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time Horizon</p>
                <p className="font-medium">6 months</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Target Industry</p>
                <p className="font-medium">Technology / SaaS</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Geography</p>
                <p className="font-medium">North America</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Company Size</p>
                <p className="font-medium">Mid-Market (101-1000)</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Key Personas</p>
                <p className="font-medium">VP Sales, CRO, RevOps</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep === steps.length}
        >
          {currentStep === steps.length ? "Complete Setup" : "Next"}
          {currentStep < steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
