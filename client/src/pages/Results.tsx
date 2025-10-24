import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, DollarSign, Calendar, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";

interface RetirementData {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyExpenses: number;
  socialSecurityAge: number;
  estimatedSSBenefit: number;
  timestamp: string;
}

interface Recommendation {
  title: string;
  description: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<RetirementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('retirementCalc');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      setLocation('/calculator');
    }
    setLoading(false);
  }, [setLocation]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your retirement strategy...</p>
        </div>
      </div>
    );
  }

  // Calculate projections
  const yearsToRetirement = data.retirementAge - data.currentAge;
  const yearsInRetirement = 90 - data.retirementAge; // Assume age 90
  const annualExpenses = data.monthlyExpenses * 12;
  const totalRetirementNeeds = annualExpenses * yearsInRetirement;
  
  // Social Security adjustments
  const ssAdjustmentFactor = data.socialSecurityAge === 62 ? 0.7 : 
                             data.socialSecurityAge === 70 ? 1.24 :
                             data.socialSecurityAge === 67 ? 1.0 :
                             1.0 + ((data.socialSecurityAge - 67) * 0.08);
  const adjustedSSBenefit = data.estimatedSSBenefit * ssAdjustmentFactor;
  const totalSSIncome = adjustedSSBenefit * 12 * (90 - data.socialSecurityAge);
  
  // Portfolio calculations
  const assumedReturn = 0.06; // 6% annual return
  const projectedSavingsAtRetirement = data.currentSavings * Math.pow(1 + assumedReturn, yearsToRetirement);
  const safeWithdrawalRate = 0.04; // 4% rule
  const annualSafeWithdrawal = projectedSavingsAtRetirement * safeWithdrawalRate;
  
  const totalProjectedIncome = (annualSafeWithdrawal * yearsInRetirement) + totalSSIncome;
  const shortfall = totalRetirementNeeds - totalProjectedIncome;
  const readinessScore = Math.min(100, Math.max(0, (totalProjectedIncome / totalRetirementNeeds) * 100));

  // Generate recommendations
  const recommendations: Recommendation[] = [];

  // Social Security timing recommendation
  if (data.socialSecurityAge < 67) {
    const delayBenefit = (data.estimatedSSBenefit * 1.0 - adjustedSSBenefit) * 12 * (90 - 67);
    recommendations.push({
      title: "Delay Social Security to Age 67",
      description: `Claiming at age ${data.socialSecurityAge} reduces your benefit by ${Math.round((1 - ssAdjustmentFactor) * 100)}%. Waiting until full retirement age (67) increases your monthly benefit from $${Math.round(adjustedSSBenefit).toLocaleString()} to $${data.estimatedSSBenefit.toLocaleString()}.`,
      impact: `Potential lifetime gain: $${Math.round(delayBenefit).toLocaleString()}`,
      priority: "high"
    });
  } else if (data.socialSecurityAge < 70) {
    const delayBenefit = (data.estimatedSSBenefit * 1.24 - adjustedSSBenefit) * 12 * (90 - 70);
    recommendations.push({
      title: "Consider Delaying Social Security to Age 70",
      description: `Each year you delay past 67 increases your benefit by 8%. Waiting until age 70 would increase your monthly benefit to $${Math.round(data.estimatedSSBenefit * 1.24).toLocaleString()}.`,
      impact: `Potential lifetime gain: $${Math.round(delayBenefit).toLocaleString()}`,
      priority: "medium"
    });
  }

  // Savings recommendations
  if (shortfall > 0) {
    const monthlyAdditionalSavings = (shortfall / yearsToRetirement) / 12;
    recommendations.push({
      title: "Increase Monthly Savings",
      description: `Based on your current trajectory, you may face a retirement income shortfall. Consider increasing your monthly savings to bridge the gap.`,
      impact: `Save an additional $${Math.round(monthlyAdditionalSavings).toLocaleString()}/month`,
      priority: "high"
    });
  }

  // Tax-efficient withdrawal strategy
  recommendations.push({
    title: "Implement Tax-Efficient Withdrawal Strategy",
    description: "Withdraw from taxable accounts first, then tax-deferred (401k/IRA), and finally tax-free (Roth IRA) to minimize lifetime tax burden.",
    impact: "Potential tax savings: $50,000 - $150,000 over retirement",
    priority: "high"
  });

  // Roth conversion opportunity
  if (yearsToRetirement > 5) {
    recommendations.push({
      title: "Consider Roth IRA Conversions",
      description: "Convert portions of traditional IRA to Roth IRA during low-income years before retirement to reduce future RMDs and create tax-free income.",
      impact: "Reduce future tax burden and RMD requirements",
      priority: "medium"
    });
  }

  // Healthcare planning
  if (data.retirementAge < 65) {
    recommendations.push({
      title: "Plan for Healthcare Costs Before Medicare",
      description: `You'll need ${65 - data.retirementAge} years of health insurance before Medicare eligibility. Budget $800-$1,500/month for coverage.`,
      impact: `Estimated cost: $${Math.round((65 - data.retirementAge) * 12 * 1000).toLocaleString()}`,
      priority: "high"
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/calculator')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Your Results</h1>
          <Button 
            variant="outline"
            onClick={() => window.print()}
          >
            Print Report
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Readiness Score */}
        <Card className="shadow-lg mb-8 border-2 border-indigo-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Retirement Readiness Score</CardTitle>
            <CardDescription>Based on your current plan and projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={readinessScore >= 80 ? "#10b981" : readinessScore >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - readinessScore / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{Math.round(readinessScore)}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {readinessScore >= 80 ? "Excellent Progress!" : 
                   readinessScore >= 60 ? "On Track with Adjustments" : 
                   "Action Needed"}
                </p>
                <p className="text-sm text-gray-600 max-w-md mt-2">
                  {readinessScore >= 80 ? "Your retirement plan is well-positioned to meet your goals." :
                   readinessScore >= 60 ? "You're making progress, but some optimizations could improve your outcome." :
                   "Consider implementing the recommendations below to strengthen your retirement security."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Projections */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Projected Savings at Retirement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                ${Math.round(projectedSavingsAtRetirement).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                At age {data.retirementAge} (assuming 6% annual return)
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Annual Safe Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                ${Math.round(annualSafeWithdrawal).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Using 4% withdrawal rule
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly Social Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                ${Math.round(adjustedSSBenefit).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Starting at age {data.socialSecurityAge}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Income vs Expenses Analysis */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Retirement Income Analysis</CardTitle>
            <CardDescription>Projected income vs. expenses over your retirement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Projected Income</span>
                <span className="text-sm font-semibold text-green-600">
                  ${Math.round(totalProjectedIncome).toLocaleString()}
                </span>
              </div>
              <Progress value={Math.min(100, (totalProjectedIncome / totalRetirementNeeds) * 100)} className="h-3" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total Retirement Needs</span>
                <span className="text-sm font-semibold text-gray-900">
                  ${Math.round(totalRetirementNeeds).toLocaleString()}
                </span>
              </div>
              <Progress value={100} className="h-3 bg-gray-200" />
            </div>

            {shortfall > 0 ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">Projected Shortfall</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Based on current projections, you may face a shortfall of ${Math.round(shortfall).toLocaleString()} over your retirement. 
                    Review the recommendations below to address this gap.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Projected Surplus</p>
                  <p className="text-sm text-green-800 mt-1">
                    Your projected income exceeds your estimated needs by ${Math.round(Math.abs(shortfall)).toLocaleString()}. 
                    This provides a buffer for unexpected expenses and lifestyle enhancements.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI-Powered Recommendations */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-indigo-600" />
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </div>
            <CardDescription>
              Personalized strategies to optimize your retirement income
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-5 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                  rec.priority === 'medium' ? 'bg-amber-50 border-amber-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    <p className="text-sm font-semibold text-indigo-600">
                      💡 {rec.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Retirement?</h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Get personalized guidance from a certified financial planner to implement these strategies 
                and maximize your retirement income.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => setLocation('/calculator')}
                >
                  Recalculate
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100 border-0"
                >
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

