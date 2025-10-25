import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Calculator as CalcIcon, Save, Users } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Calculator() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Personal Info
  const [scenarioName, setScenarioName] = useState("My Retirement Plan");
  const [currentAge, setCurrentAge] = useState(62);
  const [retirementAge, setRetirementAge] = useState(67);
  const [lifeExpectancy, setLifeExpectancy] = useState(90);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(5000);
  const [socialSecurityAge, setSocialSecurityAge] = useState(67);
  const [estimatedSSBenefit, setEstimatedSSBenefit] = useState(2500);
  
  // Spouse Info
  const [hasSpouse, setHasSpouse] = useState(false);
  const [spouseAge, setSpouseAge] = useState(60);
  const [spouseRetirementAge, setSpouseRetirementAge] = useState(67);
  const [spouseSocialSecurityAge, setSpouseSocialSecurityAge] = useState(67);
  const [spouseSocialSecurity, setSpouseSocialSecurity] = useState(2000);

  const createScenario = trpc.scenarios.create.useMutation({
    onSuccess: (data) => {
      toast.success("Scenario saved successfully!");
      handleCalculate();
    },
    onError: (error) => {
      toast.error("Failed to save scenario: " + error.message);
    }
  });

  const handleCalculate = () => {
    // Store data in sessionStorage for Results page
    const calculationData = {
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      monthlyExpenses,
      socialSecurityAge,
      estimatedSSBenefit,
      hasSpouse,
      spouseAge: hasSpouse ? spouseAge : undefined,
      spouseRetirementAge: hasSpouse ? spouseRetirementAge : undefined,
      spouseSocialSecurityAge: hasSpouse ? spouseSocialSecurityAge : undefined,
      spouseSocialSecurity: hasSpouse ? spouseSocialSecurity : undefined,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('retirementCalc', JSON.stringify(calculationData));
    setLocation('/results');
  };

  const handleSaveAndCalculate = () => {
    if (!isAuthenticated) {
      toast.error("Please login to save scenarios");
      window.location.href = getLoginUrl();
      return;
    }

    createScenario.mutate({
      name: scenarioName,
      currentAge,
      retirementAge,
      lifeExpectancy,
      currentSavings,
      monthlyExpenses,
      socialSecurityAge,
      estimatedSocialSecurity: estimatedSSBenefit,
      hasSpouse: hasSpouse ? 1 : 0,
      spouseAge: hasSpouse ? spouseAge : undefined,
      spouseRetirementAge: hasSpouse ? spouseRetirementAge : undefined,
      spouseSocialSecurityAge: hasSpouse ? spouseSocialSecurityAge : undefined,
      spouseSocialSecurity: hasSpouse ? spouseSocialSecurity : undefined,
    });
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
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="gap-2"
          >
            My Scenarios
          </Button>
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

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Scenario Name</CardTitle>
            <CardDescription>
              Give this scenario a memorable name for easy reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g., Retire at 65, Early Retirement Plan"
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg mb-6">
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

              <div className="space-y-2">
                <Label htmlFor="lifeExpectancy">Life Expectancy: {lifeExpectancy}</Label>
                <Slider
                  id="lifeExpectancy"
                  min={75}
                  max={100}
                  step={1}
                  value={[lifeExpectancy]}
                  onValueChange={(value) => setLifeExpectancy(value[0])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="currentSavings">Current Retirement Savings: ${currentSavings.toLocaleString()}</Label>
                <Slider
                  id="currentSavings"
                  min={0}
                  max={2000000}
                  step={10000}
                  value={[currentSavings]}
                  onValueChange={(value) => setCurrentSavings(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyExpenses">Expected Monthly Expenses in Retirement: ${monthlyExpenses.toLocaleString()}</Label>
                <Slider
                  id="monthlyExpenses"
                  min={2000}
                  max={15000}
                  step={500}
                  value={[monthlyExpenses]}
                  onValueChange={(value) => setMonthlyExpenses(value[0])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Social Security */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Security</h3>
              
              <div className="space-y-2">
                <Label htmlFor="socialSecurityAge">Age to Claim Social Security: {socialSecurityAge}</Label>
                <Slider
                  id="socialSecurityAge"
                  min={62}
                  max={70}
                  step={1}
                  value={[socialSecurityAge]}
                  onValueChange={(value) => setSocialSecurityAge(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedSSBenefit">Estimated Monthly Social Security Benefit: ${estimatedSSBenefit.toLocaleString()}</Label>
                <Slider
                  id="estimatedSSBenefit"
                  min={1000}
                  max={4500}
                  step={100}
                  value={[estimatedSSBenefit]}
                  onValueChange={(value) => setEstimatedSSBenefit(value[0])}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spouse/Partner Section */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Spouse/Partner Planning
                </CardTitle>
                <CardDescription>
                  Include your spouse or partner for joint retirement planning
                </CardDescription>
              </div>
              <Switch
                checked={hasSpouse}
                onCheckedChange={setHasSpouse}
              />
            </div>
          </CardHeader>
          {hasSpouse && (
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="spouseAge">Spouse Age: {spouseAge}</Label>
                <Slider
                  id="spouseAge"
                  min={50}
                  max={75}
                  step={1}
                  value={[spouseAge]}
                  onValueChange={(value) => setSpouseAge(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouseRetirementAge">Spouse Retirement Age: {spouseRetirementAge}</Label>
                <Slider
                  id="spouseRetirementAge"
                  min={55}
                  max={75}
                  step={1}
                  value={[spouseRetirementAge]}
                  onValueChange={(value) => setSpouseRetirementAge(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouseSocialSecurityAge">Spouse Social Security Age: {spouseSocialSecurityAge}</Label>
                <Slider
                  id="spouseSocialSecurityAge"
                  min={62}
                  max={70}
                  step={1}
                  value={[spouseSocialSecurityAge]}
                  onValueChange={(value) => setSpouseSocialSecurityAge(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouseSocialSecurity">Spouse Monthly Social Security: ${spouseSocialSecurity.toLocaleString()}</Label>
                <Slider
                  id="spouseSocialSecurity"
                  min={1000}
                  max={4500}
                  step={100}
                  value={[spouseSocialSecurity]}
                  onValueChange={(value) => setSpouseSocialSecurity(value[0])}
                  className="w-full"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleCalculate}
          >
            Calculate Results
          </Button>
          {isAuthenticated && (
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={handleSaveAndCalculate}
              disabled={createScenario.isPending}
            >
              <Save className="mr-2 h-5 w-5" />
              {createScenario.isPending ? "Saving..." : "Save & Calculate"}
            </Button>
          )}
        </div>

        {!isAuthenticated && (
          <p className="text-center text-sm text-gray-600 mt-4">
            <a href={getLoginUrl()} className="text-indigo-600 hover:underline">Login</a> to save and compare multiple scenarios
          </p>
        )}
      </main>
    </div>
  );
}

