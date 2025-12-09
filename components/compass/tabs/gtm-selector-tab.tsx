"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Target,
  Users,
  TrendingUp,
  Sparkles,
  Check,
  ChevronRight,
  Clock,
  BarChart3,
  AlertCircle,
  Library,
  Star,
  MoreHorizontal,
  Archive,
  Trash2,
  Search,
  Zap,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Upload,
  FileInput,
} from "lucide-react"
import { MOTION_CONFIGS, MOTION_LIBRARY, type MotionId, type GtmMotion } from "@/lib/gtm-motions"
import {
  scoreAllMotions,
  mapCompanySizeToScoring,
  mapObjectiveToScoring,
  mapAcvToScoring,
  mapTimeHorizonToScoring,
  type SelectorInputs,
  type MotionScoreBreakdown,
} from "@/lib/gtm-scoring"
import { buildWhyRecommendation } from "@/lib/gtm-explanation"
import {
  loadPlanLibrary,
  savePlanLibrary,
  createPlan,
  applyStatusChange,
  deletePlan,
  getActivePlan,
  formatPlanDate,
  getStatusLabel,
  countByStatus,
  getSeedPlanLibrary,
  generatePlanName, // Import generatePlanName
  renamePlan, // Import renamePlan
  type GtmPlan,
  type GtmPlanLibrary,
  type PlanStatus,
} from "@/lib/gtm-plans"
import { generateGtmStrategyForPlan } from "@/lib/strategy-service"

const motionMetadata: Record<
  MotionId,
  {
    id: number
    drivers: string[]
    socialProof: string
  }
> = {
  outbound_abm: {
    id: 1,
    drivers: [
      "Strong alignment with enterprise ICP targeting",
      "High-intent signals detected in target accounts",
      "Proven success pattern in your vertical",
    ],
    socialProof: "~72% of market leaders in your vertical use this motion.",
  },
  plg: {
    id: 2,
    drivers: [
      "Low friction adoption path for SMB segment",
      "Strong product-market fit indicators",
      "Viral coefficient potential identified",
    ],
    socialProof: "~67% of high-growth SaaS companies leverage PLG.",
  },
  vertical_motion: {
    id: 3,
    drivers: [
      "Deep expertise in Financial Services sector",
      "Regulatory compliance as differentiator",
      "Strong case study evidence",
    ],
    socialProof: "~58% of successful vertical plays show 2x faster sales cycles.",
  },
  inbound_engine: {
    id: 4,
    drivers: [
      "Scalable demand capture infrastructure",
      "Content-driven lead generation",
      "Marketing automation leverage",
    ],
    socialProof: "~61% of B2B SaaS companies rely on inbound as primary demand source.",
  },
  customer_expansion: {
    id: 5,
    drivers: [
      "Existing customer relationships as foundation",
      "Usage data signals expansion opportunities",
      "Lower CAC than new.logo acquisition",
    ],
    socialProof: "~85% of revenue for mature SaaS comes from expansion.",
  },
}

const expectedOutcomesByMotionId: Record<MotionId, string[]> = {
  outbound_abm: ["+18% SQL Volume", "+12% ACV", "-15% Sales Cycle"],
  plg: ["+25% Sign-ups", "+15% PQL-to-SQL", "-10% CAC"],
  vertical_motion: ["+20% Win Rate", "+15% Deal Size", "-12% Sales Cycle"],
  inbound_engine: ["+30% Inbound MQLs", "+20% Organic Traffic", "-8% CAC"],
  customer_expansion: ["+10% NRR", "+18% Expansion Revenue", "-15% Churn"],
}

const planPreviewByMotionId: Record<MotionId, string[]> = {
  outbound_abm: [
    "0–30 days: Define ICP and build target account list",
    "31–60 days: Launch 2–3 outbound sequences across email and LinkedIn",
    "61–90 days: Optimize messaging and expand to lookalike accounts",
  ],
  plg: [
    "0–30 days: Optimize signup flow and onboarding experience",
    "31–60 days: Implement in-product growth loops and referral mechanics",
    "61–90 days: Launch self-serve upgrade paths and usage-based triggers",
  ],
  vertical_motion: [
    "0–30 days: Map vertical-specific pain points and compliance requirements",
    "31–60 days: Develop tailored messaging and case studies for the vertical",
    "61–90 days: Engage vertical-specific channels and events",
  ],
  inbound_engine: [
    "0–30 days: Audit content gaps and SEO opportunities",
    "31–60 days: Launch content production and distribution campaigns",
    "61–90 days: Optimize conversion paths and lead nurture sequences",
  ],
  customer_expansion: [
    "0–30 days: Identify expansion signals from usage data",
    "31–60 days: Launch targeted upsell and cross-sell campaigns",
    "61–90 days: Implement customer success playbooks for retention",
  ],
}

const planSummaryByMotionId: Record<MotionId, string> = {
  outbound_abm:
    "this plan focuses on 200–300 target accounts, multi-threaded into VP Sales/CRO with outbound email and LinkedIn as primary channels.",
  plg: "this plan emphasizes product-led acquisition with self-serve onboarding, viral loops, and usage-based conversion triggers.",
  vertical_motion:
    "this plan targets deep vertical penetration with tailored messaging, compliance positioning, and industry-specific case studies.",
  inbound_engine:
    "this plan builds scalable demand capture through content marketing, SEO optimization, and automated lead nurturing.",
  customer_expansion:
    "this plan maximizes existing customer value through usage-based expansion signals, proactive outreach, and retention playbooks.",
}

const motionLibraryById: Record<MotionId, GtmMotion> = Object.fromEntries(
  MOTION_LIBRARY.map((m) => [m.id, m]),
) as Record<MotionId, GtmMotion>

const TOP_N_MOTIONS = 3
const DEFAULT_TENANT_ID = "default_tenant"

const MOCK_COMPANY_PROFILE = {
  companyName: "OmniGTM.ai",
  companyUrl: "https://omnigtm.ai/",
}

const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "au", label: "Australia" },
  { value: "jp", label: "Japan" },
  { value: "sg", label: "Singapore" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "mx", label: "Mexico" },
  { value: "nl", label: "Netherlands" },
  { value: "se", label: "Sweden" },
  { value: "ch", label: "Switzerland" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "il", label: "Israel" },
]

const TARGET_MARKET_GEOGRAPHY_OPTIONS = [
  { value: "global", label: "Global" },
  { value: "north-america", label: "North America" },
  { value: "emea", label: "EMEA" },
  { value: "apac", label: "APAC" },
  { value: "latam", label: "LATAM" },
  { value: "europe", label: "Europe" },
]

// Define FlowType
type FlowType = "gtm-insight" | "gtm-strategy"

interface GTMSelectorTabProps {
  onActivePlanChange?: (plan: GtmPlan | null) => void
  flowType?: FlowType
}

export function GTMSelectorTab({ onActivePlanChange, flowType = "gtm-insight" }: GTMSelectorTabProps) {
  const { toast } = useToast()
  const [companyName, setCompanyName] = useState(() =>
    flowType === "gtm-insight" ? MOCK_COMPANY_PROFILE.companyName : "",
  )
  const [companyUrl, setCompanyUrl] = useState(() =>
    flowType === "gtm-insight" ? MOCK_COMPANY_PROFILE.companyUrl : "",
  )

  // Company Profile
  const [companySize, setCompanySize] = useState("mid-market")
  const [hqCountry, setHqCountry] = useState("")
  const [industry, setIndustry] = useState("saas-tech")

  const [targetMarketGeography, setTargetMarketGeography] = useState("")

  // ICP Snapshot
  const [targetIndustry, setTargetIndustry] = useState("")
  const [targetCompanySize, setTargetCompanySize] = useState("")
  const [targetDepartments, setTargetDepartments] = useState<string[]>([])
  const [targetPersonas, setTargetPersonas] = useState("")

  // GTM Goals & Offering
  const [primaryObjective, setPrimaryObjective] = useState("")
  const [timeHorizon, setTimeHorizon] = useState("6")
  const [acvBand, setAcvBand] = useState("")
  const [primaryOffering, setPrimaryOffering] = useState("")

  // Optional Enhancers
  const [targetBuyerStage, setTargetBuyerStage] = useState("")
  const [brandVoice, setBrandVoice] = useState("")

  const [selectedMotion, setSelectedMotion] = useState<MotionId | null>(null)
  const [showWhyExpanded, setShowWhyExpanded] = useState<Record<string, boolean>>({})

  const [planLibrary, setPlanLibrary] = useState<GtmPlanLibrary>({ tenantId: DEFAULT_TENANT_ID, plans: [] })
  const [statusFilter, setStatusFilter] = useState<"all" | PlanStatus>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    type: "switch-active" | "archive-overflow" | "capacity" | "delete" | "publish" // Removed "rename" type since rename now uses separate renameState
    planId?: string
    currentActivePlan?: GtmPlan | null
    targetPlan?: GtmPlan
    oldestArchivedPlan?: GtmPlan
    errorStatus?: PlanStatus
  }>({ open: false, type: "switch-active" })

  const [isGenerating, setIsGenerating] = useState(false)

  const [renameState, setRenameState] = useState<{
    planId: string | null
    currentName: string
  }>({ planId: null, currentName: "" })

  useEffect(() => {
    if (flowType === "gtm-insight") {
      setCompanyName(MOCK_COMPANY_PROFILE.companyName)
      setCompanyUrl(MOCK_COMPANY_PROFILE.companyUrl)
    } else {
      setCompanyName("")
      setCompanyUrl("")
    }
  }, [flowType])

  useEffect(() => {
    let lib = loadPlanLibrary(DEFAULT_TENANT_ID)
    // Seed with demo data if empty
    if (lib.plans.length === 0) {
      lib = getSeedPlanLibrary(DEFAULT_TENANT_ID)
      savePlanLibrary(lib)
    }
    setPlanLibrary(lib)
  }, [])

  const activePlan = useMemo(() => getActivePlan(planLibrary), [planLibrary])

  useEffect(() => {
    onActivePlanChange?.(activePlan)
  }, [activePlan, onActivePlanChange])

  const planCounts = useMemo(() => countByStatus(planLibrary), [planLibrary])

  const filteredPlans = useMemo(() => {
    let plans = statusFilter === "all" ? planLibrary.plans : planLibrary.plans.filter((p) => p.status === statusFilter)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      plans = plans.filter((p) => p.name.toLowerCase().includes(query) || p.motionName.toLowerCase().includes(query))
    }
    // Sort: active first, then by updatedAt desc
    return plans.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1
      if (b.status === "active" && a.status !== "active") return 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  }, [planLibrary.plans, statusFilter, searchQuery])

  const persistLibrary = useCallback((lib: GtmPlanLibrary) => {
    setPlanLibrary(lib)
    savePlanLibrary(lib)
  }, [])

  const handleSetActive = useCallback(
    (plan: GtmPlan) => {
      const currentActive = getActivePlan(planLibrary)
      if (currentActive && currentActive.id !== plan.id) {
        // Show confirmation modal
        setConfirmModal({
          open: true,
          type: "switch-active",
          planId: plan.id,
          currentActivePlan: currentActive,
          targetPlan: plan,
        })
      } else {
        // No active plan, just activate
        const result = applyStatusChange(planLibrary, plan.id, "active")
        if (result.success) {
          persistLibrary(result.data)
        }
      }
    },
    [planLibrary, persistLibrary],
  )

  const handlePublish = useCallback(
    (plan: GtmPlan) => {
      const result = applyStatusChange(planLibrary, plan.id, "saved")
      if (result.success) {
        persistLibrary(result.data)
      } else if (result.error.type === "CAPACITY_EXCEEDED") {
        setConfirmModal({
          open: true,
          type: "capacity",
          planId: plan.id,
          errorStatus: result.error.status,
        })
      }
    },
    [planLibrary, persistLibrary],
  )

  const handleArchive = useCallback(
    (plan: GtmPlan) => {
      const result = applyStatusChange(planLibrary, plan.id, "archived")
      if (result.success) {
        persistLibrary(result.data)
      } else if (result.error.type === "ARCHIVE_OVERFLOW") {
        setConfirmModal({
          open: true,
          type: "archive-overflow",
          planId: plan.id,
          oldestArchivedPlan: result.error.oldestPlan,
        })
      } else if (result.error.type === "CAPACITY_EXCEEDED") {
        setConfirmModal({
          open: true,
          type: "capacity",
          planId: plan.id,
          errorStatus: result.error.status,
        })
      }
    },
    [planLibrary, persistLibrary],
  )

  const handleRestore = useCallback(
    (plan: GtmPlan) => {
      const result = applyStatusChange(planLibrary, plan.id, "saved")
      if (result.success) {
        persistLibrary(result.data)
      } else if (result.error.type === "CAPACITY_EXCEEDED") {
        setConfirmModal({
          open: true,
          type: "capacity",
          planId: plan.id,
          errorStatus: result.error.status,
        })
      }
    },
    [planLibrary, persistLibrary],
  )

  const handleDeletePlan = useCallback((plan: GtmPlan) => {
    setConfirmModal({
      open: true,
      type: "delete",
      planId: plan.id,
      targetPlan: plan,
    })
  }, [])

  const handleRenamePlan = useCallback((plan: GtmPlan) => {
    setRenameState({
      planId: plan.id,
      currentName: plan.name,
    })
  }, [])

  const confirmModalAction = useCallback(() => {
    const { type, planId, currentActivePlan, oldestArchivedPlan } = confirmModal

    if (type === "switch-active" && planId && currentActivePlan) {
      // Deactivate current, activate new
      let lib = planLibrary
      const deactivateResult = applyStatusChange(lib, currentActivePlan.id, "saved")
      if (deactivateResult.success) {
        lib = deactivateResult.data
        const activateResult = applyStatusChange(lib, planId, "active")
        if (activateResult.success) {
          persistLibrary(activateResult.data)
        }
      }
    } else if (type === "archive-overflow" && planId && oldestArchivedPlan) {
      // Force archive with overflow deletion
      const result = applyStatusChange(planLibrary, planId, "archived", { forceArchiveOverflow: true })
      if (result.success) {
        persistLibrary(result.data)
      }
    } else if (type === "delete" && planId) {
      const result = deletePlan(planLibrary, planId)
      if (result.success) {
        persistLibrary(result.data)
      }
    }

    setConfirmModal({ open: false, type: "switch-active" })
  }, [confirmModal, planLibrary, persistLibrary])

  const handleCreatePlan = useCallback(
    (asDraft = false) => {
      if (!selectedMotion) return

      const motionConfig = MOTION_CONFIGS.find((m) => m.id === selectedMotion)
      const motionMeta = motionLibraryById[selectedMotion]
      if (!motionConfig || !motionMeta) return

      const scores = scoresById[selectedMotion]
      if (!scores) return

      const newPlan: Omit<GtmPlan, "id" | "createdAt" | "updatedAt" | "tenantId"> = {
        name: generatePlanName({
          motionName: motionMeta.name,
          primaryObjective: primaryObjective || undefined,
          targetMarketGeography: targetMarketGeography || undefined,
          segment: {
            industry: industry || undefined,
            companySize: companySize || undefined,
            region: hqCountry || undefined,
          },
          createdAt: new Date(),
        }),
        status: asDraft ? "draft" : "saved",
        motionId: selectedMotion,
        motionName: motionMeta.name,
        segment: {
          industry: industry || "Not specified",
          companySize: companySize || "Not specified",
          region: hqCountry || "Not specified",
        },
        objective: primaryObjective || "pipeline",
        acvBand: (mapAcvToScoring(acvBand) as "low" | "mid" | "high") || "mid",
        personas: parsePersonas(targetPersonas),
        effort: scores.effort,
        impact: scores.impact,
        matchPercent: scores.matchPercent,
        timelineMonths: mapTimeHorizonToScoring(timeHorizon),
      }

      const result = createPlan(planLibrary, newPlan)
      if (result.success) {
        persistLibrary(result.data)
      } else if (result.error.type === "CAPACITY_EXCEEDED") {
        setConfirmModal({
          open: true,
          type: "capacity",
          errorStatus: result.error.status,
        })
      }
    },
    [
      selectedMotion,
      planLibrary,
      persistLibrary,
      industry,
      companySize,
      hqCountry,
      primaryObjective,
      acvBand,
      targetPersonas,
      timeHorizon,
      targetMarketGeography, // Added missing dependency
    ],
  )

  const clampPercent = (value?: number) => Math.min(100, Math.max(0, value ?? 0))

  const parsePersonas = (raw: string) =>
    raw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)

  const hasRequiredInputs = useMemo(() => {
    const personas = parsePersonas(targetPersonas)
    return (
      !!companyName &&
      !!companyUrl &&
      !!industry &&
      !!companySize &&
      !!hqCountry &&
      !!targetMarketGeography &&
      !!primaryObjective &&
      !!acvBand &&
      !!targetCompanySize &&
      personas.length > 0
    )
  }, [
    companyName,
    companyUrl,
    industry,
    companySize,
    hqCountry,
    targetMarketGeography,
    primaryObjective,
    acvBand,
    targetCompanySize,
    targetPersonas,
  ])

  const missingInputs = useMemo(() => {
    const missing: string[] = []
    if (!companyName) missing.push("Company")
    if (!companyUrl) missing.push("Website")
    if (!industry) missing.push("Industry")
    if (!companySize) missing.push("Company Size")
    if (!hqCountry) missing.push("HQ Country")
    if (!targetMarketGeography) missing.push("Target Market Geography")
    if (!primaryObjective) missing.push("Primary GTM Objective")
    if (!acvBand) missing.push("ACV Band")
    if (!targetCompanySize) missing.push("Target Company Size")
    if (parsePersonas(targetPersonas).length === 0) missing.push("Target Personas")
    return missing
  }, [
    companyName,
    companyUrl,
    industry,
    companySize,
    hqCountry,
    targetMarketGeography,
    primaryObjective,
    acvBand,
    targetCompanySize,
    targetPersonas,
  ])

  const selectorInputs: SelectorInputs = useMemo(
    () => ({
      companyName,
      companyUrl,
      hqCountry,
      targetMarketGeography,
      companySize: mapCompanySizeToScoring(companySize),
      primaryObjective: mapObjectiveToScoring(primaryObjective),
      acvBand: mapAcvToScoring(acvBand),
      personas: parsePersonas(targetPersonas),
      timeHorizonMonths: mapTimeHorizonToScoring(timeHorizon),
    }),
    [
      companyName,
      companyUrl,
      hqCountry,
      targetMarketGeography,
      acvBand,
      companySize,
      primaryObjective,
      targetPersonas,
      timeHorizon,
    ],
  )

  const motionScores = useMemo(() => {
    if (!hasRequiredInputs) return []
    return scoreAllMotions(selectorInputs)
  }, [selectorInputs, hasRequiredInputs])

  const scoresById = useMemo(
    () =>
      motionScores.reduce(
        (acc, ms) => {
          acc[ms.motionId] = ms
          return acc
        },
        {} as Record<MotionId, MotionScoreBreakdown>,
      ),
    [motionScores],
  )

  const handleGenerateStrategy = useCallback(async () => {
    // Guard: require inputs and selected motion
    if (!hasRequiredInputs) {
      toast({
        title: "Missing Required Inputs",
        description: "Please complete all required inputs before generating a strategy.",
        variant: "destructive",
      })
      return
    }

    if (!selectedMotion) {
      toast({
        title: "No Motion Selected",
        description: "Please select a GTM motion before generating a strategy.",
        variant: "destructive",
      })
      return
    }

    const motionConfig = MOTION_CONFIGS.find((m) => m.id === selectedMotion)
    const motionMeta = motionLibraryById[selectedMotion]
    if (!motionConfig || !motionMeta) return

    const scores = scoresById[selectedMotion]
    if (!scores) return

    setIsGenerating(true)

    try {
      const now = new Date()
      const newPlanName = generatePlanName({
        motionName: motionMeta.name,
        primaryObjective: primaryObjective || undefined,
        targetMarketGeography: targetMarketGeography || undefined,
        segment: {
          industry: industry || undefined,
          companySize: companySize || undefined,
          region: hqCountry || undefined,
        },
        createdAt: now,
      })

      // Create or update plan as Active
      const newPlan: Omit<GtmPlan, "id" | "createdAt" | "updatedAt" | "tenantId"> = {
        name: newPlanName, // Use generated name
        status: "active", // Create as active plan
        motionId: selectedMotion,
        motionName: motionMeta.name,
        segment: {
          industry: industry || "Not specified",
          companySize: companySize || "Not specified",
          region: hqCountry || "Not specified",
        },
        objective: primaryObjective || "pipeline",
        acvBand: (mapAcvToScoring(acvBand) as "low" | "mid" | "high") || "mid",
        personas: parsePersonas(targetPersonas),
        effort: scores.effort,
        impact: scores.impact,
        matchPercent: scores.matchPercent,
        timelineMonths: mapTimeHorizonToScoring(timeHorizon),
      }

      const result = createPlan(planLibrary, newPlan)

      if (result.success) {
        persistLibrary(result.data)

        // Find the newly created active plan
        const activePlan = getActivePlan(result.data)

        if (activePlan) {
          // Call strategy generation hook
          const strategyResult = await generateGtmStrategyForPlan(activePlan)

          if (strategyResult.success) {
            toast({
              title: "GTM Strategy Generated",
              description: strategyResult.message || "Continue in Analyze Position to review details.",
            })
          } else {
            toast({
              title: "Strategy Generation Failed",
              description: "The plan was saved but strategy generation encountered an error.",
              variant: "destructive",
            })
          }
        }
      } else if (result.error.type === "CAPACITY_EXCEEDED") {
        setConfirmModal({
          open: true,
          type: "capacity",
          errorStatus: result.error.status,
        })
      }
    } catch (error) {
      console.error("[GTMSelector] Strategy generation error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating the strategy.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    hasRequiredInputs,
    selectedMotion,
    planLibrary,
    persistLibrary,
    industry,
    companySize,
    hqCountry,
    primaryObjective,
    acvBand,
    targetPersonas,
    timeHorizon,
    scoresById,
    toast,
    motionLibraryById, // Added motionLibraryById
    generatePlanName, // Added generatePlanName
    primaryObjective, // Added primaryObjective
    targetMarketGeography, // Added targetMarketGeography
    companySize, // Added companySize
    industry, // Added industry
    hqCountry, // Added hqCountry
  ])

  const sortedMotions = useMemo(() => {
    return [...motionScores].sort((a, b) => b.matchPercent - a.matchPercent)
  }, [motionScores])

  const topMotions = sortedMotions.slice(0, TOP_N_MOTIONS)

  const showRecommendations = hasRequiredInputs && topMotions.length > 0

  const selectedMotionScores = selectedMotion ? scoresById[selectedMotion] : null

  const explainersById = useMemo(() => {
    if (!hasRequiredInputs) return {} as Record<MotionId, string[]>
    return MOTION_CONFIGS.reduce(
      (acc, motion) => {
        const scores = scoresById[motion.id]
        if (scores) {
          acc[motion.id] = buildWhyRecommendation(motion, scores, selectorInputs)
        }
        return acc
      },
      {} as Record<MotionId, string[]>,
    )
  }, [scoresById, selectorInputs, hasRequiredInputs])

  // Department options for multi-select
  const departmentOptions = [
    "Sales",
    "Marketing",
    "RevOps",
    "Customer Success",
    "Product",
    "Engineering",
    "Finance",
    "IT",
  ]

  // Function to toggle department selection
  const toggleDepartment = (dept: string) => {
    setTargetDepartments((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]))
  }

  const handleSaveDraft = useCallback(() => {
    if (!selectedMotion) return

    const motionConfig = MOTION_CONFIGS.find((m) => m.id === selectedMotion)
    const motionMeta = motionLibraryById[selectedMotion]
    if (!motionConfig || !motionMeta) return

    const scores = scoresById[selectedMotion]
    if (!scores) return

    const now = new Date()
    const newPlanName = generatePlanName({
      motionName: motionMeta.name,
      primaryObjective: primaryObjective || undefined,
      targetMarketGeography: targetMarketGeography || undefined,
      segment: {
        industry: industry || undefined,
        companySize: companySize || undefined,
        region: hqCountry || undefined,
      },
      createdAt: now,
    })

    const newPlan: Omit<GtmPlan, "id" | "createdAt" | "updatedAt" | "tenantId"> = {
      name: newPlanName, // Use generated name
      status: "draft", // Always draft now
      motionId: selectedMotion,
      motionName: motionMeta.name,
      segment: {
        industry: industry || "Not specified",
        companySize: companySize || "Not specified",
        region: hqCountry || "Not specified",
      },
      objective: primaryObjective || "pipeline",
      acvBand: (mapAcvToScoring(acvBand) as "low" | "mid" | "high") || "mid",
      personas: parsePersonas(targetPersonas),
      effort: scores.effort,
      impact: scores.impact,
      matchPercent: scores.matchPercent,
      timelineMonths: mapTimeHorizonToScoring(timeHorizon),
    }

    const result = createPlan(planLibrary, newPlan)
    if (result.success) {
      persistLibrary(result.data)
      toast({
        title: "Draft Saved",
        description: "Your GTM configuration has been saved as a draft.",
      })
    } else if (result.error.type === "CAPACITY_EXCEEDED") {
      setConfirmModal({
        open: true,
        type: "capacity",
        errorStatus: result.error.status,
      })
    }
  }, [
    selectedMotion,
    planLibrary,
    persistLibrary,
    industry,
    companySize,
    hqCountry,
    primaryObjective,
    acvBand,
    targetPersonas,
    timeHorizon,
    scoresById,
    toast,
    motionLibraryById, // Added motionLibraryById
    generatePlanName, // Added generatePlanName
  ])

  return (
    <div className="space-y-6">
      {/* Three Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Inputs */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileInput className="h-5 w-5 text-primary" />
            Inputs
          </h3>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Website <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="https://company.com"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Industry <span className="text-destructive">*</span>
                </Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas-tech">Technology / SaaS</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail / E-commerce</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Company Size <span className="text-destructive">*</span>
                </Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-50)</SelectItem>
                    <SelectItem value="smb">SMB (51-200)</SelectItem>
                    <SelectItem value="mid-market">Mid-Market (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  HQ Country <span className="text-destructive">*</span>
                </Label>
                <Select value={hqCountry} onValueChange={setHqCountry}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                ICP Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Target Market Geography <span className="text-destructive">*</span>
                </Label>
                <Select value={targetMarketGeography} onValueChange={setTargetMarketGeography}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select target geography" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_MARKET_GEOGRAPHY_OPTIONS.map((geo) => (
                      <SelectItem key={geo.value} value={geo.value}>
                        {geo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Where your GTM initiative is aimed</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target Industry</Label>
                <Select value={targetIndustry} onValueChange={setTargetIndustry}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select target industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas-tech">Technology / SaaS</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail / E-commerce</SelectItem>
                    <SelectItem value="professional-services">Professional Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Target Company Size <span className="text-destructive">*</span>
                </Label>
                <Select value={targetCompanySize} onValueChange={setTargetCompanySize}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-50)</SelectItem>
                    <SelectItem value="smb">SMB (51-200)</SelectItem>
                    <SelectItem value="mid-market">Mid-Market (201-1000)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Target Personas <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-9 text-sm"
                  placeholder="e.g. VP Sales, CRO, RevOps"
                  value={targetPersonas}
                  onChange={(e) => setTargetPersonas(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Comma-separated list</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                GTM Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Primary GTM Objective <span className="text-destructive">*</span>
                </Label>
                <Select value={primaryObjective} onValueChange={setPrimaryObjective}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="font-semibold text-foreground">Marketing Objectives</SelectLabel>
                      <SelectItem value="generate-awareness">Generate Market Awareness</SelectItem>
                      <SelectItem value="create-demand">Create Demand Pipeline</SelectItem>
                      <SelectItem value="category-leadership">Position for Category Leadership</SelectItem>
                      <SelectItem value="new-offering">Launch New Offering / Market Entry</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="font-semibold text-foreground">Sales Objectives</SelectLabel>
                      <SelectItem value="accelerate-pipeline">Accelerate Pipeline Conversion</SelectItem>
                      <SelectItem value="expand-accounts">Expand Strategic Accounts</SelectItem>
                      <SelectItem value="scale-revenue">Scale Revenue Operations</SelectItem>
                      <SelectItem value="optimize-pricing">Optimize Pricing & Packaging Impact</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="font-semibold text-foreground">Customer Success Objectives</SelectLabel>
                      <SelectItem value="drive-adoption">Drive Adoption & Retention</SelectItem>
                      <SelectItem value="customer-advocacy">Expand Customer Advocacy</SelectItem>
                      <SelectItem value="increase-nrr">Increase Net Revenue Retention (NRR)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  ACV Band <span className="text-destructive">*</span>
                </Label>
                <Select value={acvBand} onValueChange={setAcvBand}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select ACV band" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (&lt;$10K)</SelectItem>
                    <SelectItem value="mid">Mid ($10K-$100K)</SelectItem>
                    <SelectItem value="high">High (&gt;$100K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Time Horizon <span className="text-destructive">*</span>
                </Label>
                <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="9">9 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Optional Enhancers
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Target Buyer Stage</Label>
                    <Select value={targetBuyerStage} onValueChange={setTargetBuyerStage}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Awareness</SelectItem>
                        <SelectItem value="consideration">Consideration</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="expansion">Expansion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Brand Voice</Label>
                    <Select value={brandVoice} onValueChange={setBrandVoice}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="bold">Bold / Challenger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Required Inputs Status */}
          {!hasRequiredInputs && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-800">Required Inputs</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Company",
                        "Website",
                        "Industry",
                        "Company Size",
                        "HQ Country",
                        "Target Geo",
                        "Objective",
                        "ACV",
                        "Target Size",
                        "Personas",
                      ].map((field) => {
                        const isSet = !missingInputs.includes(
                          field === "Objective"
                            ? "Primary GTM Objective"
                            : field === "ACV"
                              ? "ACV Band"
                              : field === "Target Size"
                                ? "Target Company Size"
                                : field === "Target Geo"
                                  ? "Target Market Geography"
                                  : field === "Company"
                                    ? "Company"
                                    : field === "Website"
                                      ? "Website"
                                      : field === "HQ Country"
                                        ? "HQ Country"
                                        : field === "Personas"
                                          ? "Target Personas"
                                          : field,
                        )
                        return (
                          <Badge
                            key={field}
                            variant="outline"
                            className={cn(
                              "text-xs",
                              isSet
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200",
                            )}
                          >
                            {isSet && <Check className="h-3 w-3 mr-1" />}
                            {field}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Middle Column – Recommendations */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Recommended GTM Motions
            </h3>
            {showRecommendations && (
              <Badge variant="secondary" className="text-xs">
                Top {TOP_N_MOTIONS} of {motionScores.length}
              </Badge>
            )}
          </div>

          {!hasRequiredInputs ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Waiting for Required Inputs</h4>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  Set Company, Website, Industry, Company Size, HQ Country, Target Geography, Objective, ACV, Target
                  Size, and Personas to see AI GTM recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topMotions.map((motion, index) => {
                const config = MOTION_CONFIGS.find((m) => m.id === motion.motionId)!
                const meta = motionMetadata[motion.motionId]
                const motionLib = motionLibraryById[motion.motionId]
                const isSelected = selectedMotion === motion.motionId
                const explanations = explainersById[motion.motionId] || []

                return (
                  <Card
                    key={motion.motionId}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected ? "border-primary ring-1 ring-primary/20" : "hover:border-primary/50",
                    )}
                    onClick={() => setSelectedMotion(motion.motionId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                              index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{motionLib?.name ?? config.id}</h4>
                            <p className="text-xs text-muted-foreground">{motionLib?.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{motion.matchPercent}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Effort</span>
                            <span className="font-medium">{motion.effort}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all"
                              style={{ width: `${motion.effort}%` }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Impact</span>
                            <span className="font-medium">{motion.impact}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${motion.impact}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <Collapsible
                        open={showWhyExpanded[motion.motionId]}
                        onOpenChange={(open) => setShowWhyExpanded((prev) => ({ ...prev, [motion.motionId]: open }))}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-between h-8 px-2">
                            <span className="text-xs font-medium">Why this motion?</span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                showWhyExpanded[motion.motionId] && "rotate-180",
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pt-2 space-y-1.5">
                            {explanations.slice(0, 3).map((reason, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                <span>{reason}</span>
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground/70 italic pt-1">{meta?.socialProof}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {showRecommendations && (
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="w-full mt-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMotion(motion.motionId)
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Selected
                            </>
                          ) : (
                            "Select This Motion"
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column – Selected GTM Path */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Selected GTM Path
          </h3>

          {!hasRequiredInputs ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">Waiting for Required Inputs</h4>
                <p className="text-sm text-muted-foreground max-w-[220px]">
                  Set Company, Website, Industry, Company Size, HQ Country, Target Geography, Objective, ACV, Target
                  Size, and Personas to preview an AI GTM plan.
                </p>
              </CardContent>
            </Card>
          ) : selectedMotion && selectedMotionScores ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Motion Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{motionLibraryById[selectedMotion]?.name}</h4>
                    <p className="text-xs text-muted-foreground">{motionLibraryById[selectedMotion]?.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{selectedMotionScores.matchPercent}%</div>
                    <div className="text-xs text-muted-foreground">Match Score</div>
                  </div>
                </div>

                {/* Plan Context */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plan Context</h5>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {industry || "Industry"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {companySize || "Size"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {hqCountry || "HQ"} {/* Use hqCountry */}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {targetMarketGeography || "Target Geo"} {/* Use targetMarketGeography */}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {parsePersonas(targetPersonas).length} Personas
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {primaryObjective || "Objective"}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      ACV: {acvBand || "—"}
                    </Badge>
                  </div>
                </div>

                {/* Why Recommended */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Why Recommended
                  </h5>
                  <ul className="space-y-1.5">
                    {(explainersById[selectedMotion] || []).slice(0, 4).map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fit Breakdown */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fit Breakdown</h5>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Objective Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.objectiveFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.objectiveFit)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Size Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.sizeFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.sizeFit)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">ACV Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.acvFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.acvFit)} className="h-1.5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Persona Fit</span>
                        <span className="font-medium">{clampPercent(selectedMotionScores.personaFit)}%</span>
                      </div>
                      <Progress value={clampPercent(selectedMotionScores.personaFit)} className="h-1.5" />
                    </div>
                  </div>
                </div>

                {/* Expected Outcomes */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Expected Outcomes
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(expectedOutcomesByMotionId[selectedMotion] ?? []).map((outcome, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium px-2.5 py-1",
                          outcome.startsWith("+") && "bg-green-50 text-green-700 border border-green-200",
                          outcome.startsWith("-") && "bg-blue-50 text-blue-700 border border-blue-200",
                        )}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {outcome}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Estimates are directional and based on this GTM motion and timeline.
                  </p>
                </div>

                {/* Timeline & Execution */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Timeline & Execution
                  </h5>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Timeline
                    </Label>
                    <div className="flex rounded-lg border bg-muted/30 p-0.5">
                      {["3", "6", "9", "12"].map((months) => (
                        <button
                          key={months}
                          onClick={() => setTimeHorizon(months)}
                          className={cn(
                            "flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-colors",
                            timeHorizon === months
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {months}mo
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI GTM Plan Preview */}
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    AI GTM Plan Preview
                  </h5>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <ul className="space-y-1.5">
                      {(planPreviewByMotionId[selectedMotion] ?? []).map((milestone, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                          <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                      Over the next <span className="font-medium text-foreground">{timeHorizon} months</span>,{" "}
                      {planSummaryByMotionId[selectedMotion]}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Helper text */}
                  <p className="text-xs text-muted-foreground text-center">
                    Use this to populate downstream analysis tabs with this GTM path.
                  </p>

                  {/* Primary CTA: Generate GTM Strategy */}
                  <Button
                    className="w-full"
                    size="default"
                    disabled={!hasRequiredInputs || !selectedMotion || isGenerating}
                    onClick={handleGenerateStrategy}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate GTM Strategy
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Secondary actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={handleSaveDraft}
                      disabled={isGenerating}
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Save as Draft
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Save a draft configuration without generating a full strategy.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground mb-2">No Motion Selected</h4>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Select a GTM motion from the recommendations to see details and generate a plan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-6" data-plan-library>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              GTM Plan Library
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your Draft, Published, Archived, and Active GTM plans.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {planCounts.active} Active
            </Badge>
            <Badge variant="outline" className="text-xs">
              {planCounts.saved} Published
            </Badge>
            <Badge variant="outline" className="text-xs">
              {planCounts.draft} Drafts
            </Badge>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {(["all", "active", "saved", "draft", "archived"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  statusFilter === status
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {status === "all"
                  ? "All"
                  : status === "saved"
                    ? "Published"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Plan Library Table */}
        {filteredPlans.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Library className="h-6 w-6 text-muted-foreground" />
              </div>
              {planLibrary.plans.length === 0 ? (
                <>
                  <h4 className="font-medium text-foreground mb-2">You don't have any GTM plans yet</h4>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    Generate your first GTM plan from Selected GTM Path above.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-medium text-foreground mb-2">
                    No {statusFilter === "saved" ? "Published" : statusFilter} plans found
                  </h4>
                  <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
                    Clear filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[280px]">Plan</TableHead>
                  <TableHead className="w-[200px]">Segment</TableHead>
                  <TableHead className="w-[180px]">Objective & ACV</TableHead>
                  <TableHead className="w-[140px]">Effort / Impact</TableHead>
                  <TableHead className="w-[100px]">Updated</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} className={cn(plan.status === "archived" && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">{plan.name}</span>
                            <Badge
                              variant={plan.status === "active" ? "default" : "outline"}
                              className={cn(
                                "text-xs shrink-0",
                                plan.status === "active" && "bg-primary text-primary-foreground",
                                plan.status === "saved" && "bg-blue-50 text-blue-700 border-blue-200",
                                plan.status === "draft" &&
                                  "bg-transparent text-muted-foreground border-muted-foreground/50",
                                plan.status === "archived" && "bg-muted text-muted-foreground border-muted",
                              )}
                            >
                              {getStatusLabel(plan.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{plan.motionName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate">
                        {plan.segment.industry} · {plan.segment.companySize} · {plan.segment.region}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {plan.objective}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {plan.acvBand.toUpperCase()} ACV
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${plan.effort}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{plan.effort}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${plan.impact}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{plan.impact}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{formatPlanDate(plan.updatedAt)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {plan.status === "active" ? (
                          <Star className="h-4 w-4 text-primary fill-primary" aria-label="Currently Active" />
                        ) : plan.status === "saved" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleSetActive(plan)}
                            title="Set as Active"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRenamePlan(plan)}>
                              <SlidersHorizontal className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            {plan.status === "draft" && (
                              <>
                                <DropdownMenuItem onClick={() => handlePublish(plan)}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Publish
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeletePlan(plan)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                            {plan.status === "saved" && (
                              <>
                                <DropdownMenuItem onClick={() => handleSetActive(plan)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  Set as Active
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleArchive(plan)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            )}
                            {plan.status === "active" && (
                              <DropdownMenuItem onClick={() => handleArchive(plan)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            {plan.status === "archived" && (
                              <>
                                <DropdownMenuItem onClick={() => handleRestore(plan)}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Restore as Published
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeletePlan(plan)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Permanently
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={confirmModal.open}
        onOpenChange={(open) => !open && setConfirmModal({ ...confirmModal, open: false })}
      >
        <DialogContent>
          {confirmModal.type === "switch-active" && (
            <>
              <DialogHeader>
                <DialogTitle>Switch Active GTM Plan?</DialogTitle>
                <DialogDescription>
                  You currently have <span className="font-medium">{confirmModal.currentActivePlan?.name}</span> set as
                  your active plan. Switching will move it to Published status.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Badge variant="outline" className="text-xs">
                    Current
                  </Badge>
                  <span className="font-medium">{confirmModal.currentActivePlan?.name}</span>
                </div>
                <div className="flex items-center justify-center">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Badge className="text-xs bg-primary">New Active</Badge>
                  <span className="font-medium">{confirmModal.targetPlan?.name}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
                  Cancel
                </Button>
                <Button onClick={confirmModalAction}>Switch Active Plan</Button>
              </DialogFooter>
            </>
          )}

          {confirmModal.type === "archive-overflow" && (
            <>
              <DialogHeader>
                <DialogTitle>Archive Limit Reached</DialogTitle>
                <DialogDescription>
                  You have reached the maximum of 10 archived plans. Archiving this plan will permanently delete the
                  oldest archived plan.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive">
                    <span className="font-medium">{confirmModal.oldestArchivedPlan?.name}</span> will be permanently
                    deleted.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Archived{" "}
                    {confirmModal.oldestArchivedPlan?.archivedAt
                      ? formatPlanDate(confirmModal.oldestArchivedPlan.archivedAt)
                      : "—"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmModalAction}>
                  Archive & Delete Oldest
                </Button>
              </DialogFooter>
            </>
          )}

          {confirmModal.type === "capacity" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {confirmModal.errorStatus === "saved"
                    ? "Published"
                    : confirmModal.errorStatus === "draft"
                      ? "Draft"
                      : "Plan"}{" "}
                  Limit Reached
                </DialogTitle>
                <DialogDescription>
                  You already have{" "}
                  {confirmModal.errorStatus === "saved"
                    ? "5 Published"
                    : confirmModal.errorStatus === "draft"
                      ? "5 Draft"
                      : "maximum"}{" "}
                  GTM plans. Archive or delete one before adding another.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setStatusFilter(confirmModal.errorStatus === "saved" ? "saved" : "draft")
                    setConfirmModal({ ...confirmModal, open: false })
                  }}
                >
                  View {confirmModal.errorStatus === "saved" ? "Published" : "Draft"} Plans
                </Button>
              </DialogFooter>
            </>
          )}

          {confirmModal.type === "delete" && (
            <>
              <DialogHeader>
                <DialogTitle>Delete Plan?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete{" "}
                  <span className="font-medium">{confirmModal.targetPlan?.name}</span>? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmModalAction}>
                  Delete Plan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={!!renameState.planId}
        onOpenChange={(open) => !open && setRenameState({ planId: null, currentName: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename GTM Plan</DialogTitle>
            <DialogDescription>Update the name shown in your GTM Plan Library.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="plan-name">Plan name</Label>
            <Input
              id="plan-name"
              value={renameState.currentName}
              onChange={(e) => setRenameState((prev) => ({ ...prev, currentName: e.target.value }))}
              placeholder="Enter plan name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameState({ planId: null, currentName: "" })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!renameState.planId) return
                const result = renamePlan(planLibrary, renameState.planId, renameState.currentName)
                if (result.success) {
                  persistLibrary(result.data)
                  toast({ title: "Plan renamed", description: "The GTM plan name was updated." })
                  setRenameState({ planId: null, currentName: "" })
                } else if (result.error?.type === "VALIDATION_ERROR") {
                  toast({ title: "Invalid name", description: result.error.message, variant: "destructive" })
                } else {
                  toast({ title: "Rename failed", description: "Could not rename this plan.", variant: "destructive" })
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
