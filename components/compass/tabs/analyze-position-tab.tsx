"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const companyOverview = {
  summary: `Acme Corp is a well-established enterprise software company with strong 
  market positioning in the CRM and sales automation space. The company has demonstrated 
  consistent growth over the past three years, with a particularly strong presence in 
  the North American mid-market segment.`,
  region: "North America",
  position: "Market Challenger",
  offerings: ["Enterprise CRM", "Sales Automation", "AI Analytics", "Integration Platform"],
}

const swotData = {
  strengths: [
    {
      title: "Strong Product-Market Fit",
      description: "High customer satisfaction scores and low churn rates indicate strong alignment with market needs.",
      impact: "High",
      category: "Product",
    },
    {
      title: "Experienced Sales Team",
      description: "Tenured sales organization with deep industry expertise and established relationships.",
      impact: "High",
      category: "Operations",
    },
    {
      title: "Robust Technology Stack",
      description: "Modern, scalable architecture enables rapid feature development and reliable performance.",
      impact: "Medium",
      category: "Product",
    },
  ],
  weaknesses: [
    {
      title: "Limited Brand Awareness",
      description: "Lower brand recognition compared to market leaders in enterprise segment.",
      impact: "High",
      category: "Market",
    },
    {
      title: "Geographic Concentration",
      description: "Revenue heavily concentrated in North America with limited international presence.",
      impact: "Medium",
      category: "Market",
    },
    {
      title: "Integration Gaps",
      description: "Missing integrations with several popular enterprise tools in target market.",
      impact: "Medium",
      category: "Product",
    },
  ],
  opportunities: [
    {
      title: "AI-Driven Features",
      description: "Growing market demand for AI-powered sales tools creates expansion opportunity.",
      impact: "High",
      category: "Product",
    },
    {
      title: "Mid-Market Growth",
      description: "Underserved mid-market segment shows strong growth potential and lower competition.",
      impact: "High",
      category: "Market",
    },
    {
      title: "Partner Ecosystem",
      description: "Strategic partnerships can accelerate market reach and product capabilities.",
      impact: "Medium",
      category: "Operations",
    },
  ],
  threats: [
    {
      title: "Increased Competition",
      description: "New entrants and aggressive pricing from incumbents creating pressure on margins.",
      impact: "High",
      category: "Market",
    },
    {
      title: "Economic Uncertainty",
      description: "Potential budget cuts in target segment could slow sales cycles and deal sizes.",
      impact: "Medium",
      category: "Financial",
    },
    {
      title: "Rapid Tech Changes",
      description: "Fast-evolving technology landscape requires continuous investment in R&D.",
      impact: "Medium",
      category: "Product",
    },
  ],
}

const recommendations = [
  {
    id: 1,
    title: "Double Down on AI Capabilities",
    description:
      "Invest in AI-driven features to differentiate from competition and address growing market demand. Focus on predictive analytics and automated workflows.",
  },
  {
    id: 2,
    title: "Expand Mid-Market Focus",
    description:
      "Develop targeted GTM motion for mid-market segment with streamlined onboarding and competitive pricing to capture underserved market.",
  },
  {
    id: 3,
    title: "Build Strategic Partnerships",
    description:
      "Establish partnerships with complementary vendors to expand integration ecosystem and leverage partner channels for market reach.",
  },
]

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "High":
      return "bg-red-100 text-red-700"
    case "Medium":
      return "bg-amber-100 text-amber-700"
    case "Low":
      return "bg-green-100 text-green-700"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Market":
      return "bg-blue-100 text-blue-700"
    case "Product":
      return "bg-purple-100 text-purple-700"
    case "Operations":
      return "bg-green-100 text-green-700"
    case "Financial":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

const getSectionIcon = (section: string) => {
  switch (section) {
    case "strengths":
      return <TrendingUp className="h-5 w-5 text-green-600" />
    case "weaknesses":
      return <TrendingDown className="h-5 w-5 text-red-600" />
    case "opportunities":
      return <Target className="h-5 w-5 text-blue-600" />
    case "threats":
      return <AlertTriangle className="h-5 w-5 text-amber-600" />
    default:
      return null
  }
}

export function AnalyzePositionTab() {
  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">{companyOverview.summary}</p>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Region:</span>{" "}
                  <span className="font-medium">{companyOverview.region}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Market Position:</span>{" "}
                  <span className="font-medium">{companyOverview.position}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {companyOverview.offerings.map((offering) => (
                <Badge key={offering} variant="secondary" className="text-xs">
                  {offering}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SWOT Analysis */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">SWOT Analysis</h3>
        <Accordion
          type="multiple"
          defaultValue={["strengths", "weaknesses", "opportunities", "threats"]}
          className="space-y-4"
        >
          {(Object.keys(swotData) as Array<keyof typeof swotData>).map((section) => (
            <AccordionItem key={section} value={section} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  {getSectionIcon(section)}
                  <span className="font-semibold capitalize">{section}</span>
                  <Badge variant="secondary" className="text-xs">
                    {swotData[section].length} items
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  {swotData[section].map((item, index) => (
                    <div key={index} className="flex items-start justify-between rounded-lg bg-accent/50 p-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="ml-4 flex flex-col gap-2 items-end">
                        <Badge className={cn("text-xs", getImpactColor(item.impact))}>{item.impact} Impact</Badge>
                        <Badge className={cn("text-xs", getCategoryColor(item.category))}>{item.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Strategic Recommendations */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Strategic Recommendations</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary mb-3">
                  {rec.id}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{rec.title}</h4>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
