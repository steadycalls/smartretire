import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Calculator as CalcIcon } from "lucide-react";

export default function Calculator() {
  const [, setLocation] = useLocation();
  const [currentAge, setCurrentAge] = useState(62);
  const [retirementAge, setRetirementAge] = useState(67);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(5000);
  const [socialSecurityAge, setSocialSecurityAge] = useState(67);
  const [estimatedSSBenefit, setEstimatedSSBenefit] = useState(2500);

  const handleCalculate = () => {
    // Store data in sessionStorage for Results page
    const calculationData = {
      currentAge,
      retirementAge,
      currentSavings,
      monthlyExpenses,
      socialSecurityAge,
      estimatedSSBenefit,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('retirementCalc', JSON.stringify(calculationData));
    setLocation('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">SmartRetire Calculator</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <CalcIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Retirement Income Calculator</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your information below to receive personalized retirement income optimization recommendations
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Retirement Profile</CardTitle>
            <CardDescription>
              Provide accurate information for the most precise recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Age Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Age & Timeline</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentAge">Current Age: {currentAge}</Label>
                <Slider
                  id="currentAge"
                  min={50}
                  max={75}
                  step={1}
                  value={[currentAge]}
                  onValueChange={(value) => setCurrentAge(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirementAge">Planned Retirement Age: {retirementAge}</Label>
                <Slider
                  id="retirementAge"
                  min={55}
                  max={75}
                  step={1}
                  value={[retirementAge]}
                  onValueChange={(value) => setRetirementAge(value[0])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentSavings">Total Retirement Savings ($)</Label>
                <Input
                  id="currentSavings"
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  placeholder="500000"
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  Include all retirement accounts (401k, IRA, Roth IRA, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyExpenses">Expected Monthly Expenses in Retirement ($)</Label>
                <Input
                  id="monthlyExpenses"
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  placeholder="5000"
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  Estimate your monthly living expenses during retirement
                </p>
              </div>
            </div>

            {/* Social Security */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Security</h3>
              
              <div className="space-y-2">
                <Label htmlFor="socialSecurityAge">Planned Social Security Claiming Age: {socialSecurityAge}</Label>
                <Slider
                  id="socialSecurityAge"
                  min={62}
                  max={70}
                  step={1}
                  value={[socialSecurityAge]}
                  onValueChange={(value) => setSocialSecurityAge(value[0])}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  Age 62 (earliest) to 70 (maximum benefit)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedSSBenefit">Estimated Monthly Social Security Benefit at Age 67 ($)</Label>
                <Input
                  id="estimatedSSBenefit"
                  type="number"
                  value={estimatedSSBenefit}
                  onChange={(e) => setEstimatedSSBenefit(Number(e.target.value))}
                  placeholder="2500"
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  Check your benefit estimate at <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">SSA.gov</a>
                </p>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-6">
              <Button 
                onClick={handleCalculate}
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                disabled={currentAge >= retirementAge}
              >
                Calculate My Retirement Strategy
              </Button>
              {currentAge >= retirementAge && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  Retirement age must be greater than current age
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>Disclaimer:</strong> This calculator provides educational estimates only and should not be considered financial advice. 
            Consult with a qualified financial advisor for personalized retirement planning.
          </p>
        </div>
      </main>
    </div>
  );
}

