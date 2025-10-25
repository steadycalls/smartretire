import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RothCalculator() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  
  const [currentAge, setCurrentAge] = useState(55);
  const [traditionalIraBalance, setTraditionalIraBalance] = useState(500000);
  const [currentTaxBracket, setCurrentTaxBracket] = useState(24);
  const [retirementTaxBracket, setRetirementTaxBracket] = useState(22);
  const [conversionAmount, setConversionAmount] = useState(100000);
  const [conversionYear, setConversionYear] = useState(new Date().getFullYear());
  
  const [result, setResult] = useState<any>(null);

  const analyzeRoth = trpc.roth.analyze.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete!");
    },
    onError: (error) => {
      toast.error("Analysis failed: " + error.message);
    }
  });

  const handleAnalyze = () => {
    if (!isAuthenticated) {
      toast.error("Please login to save Roth conversion analyses");
      return;
    }

    analyzeRoth.mutate({
      currentAge,
      traditionalIraBalance,
      currentTaxBracket,
      retirementTaxBracket,
      conversionAmount,
      conversionYear,
    });
  };

  const handleQuickCalculate = () => {
    // Quick calculation without saving
    const taxesPaidNow = Math.round(conversionAmount * (currentTaxBracket / 100));
    const taxesSavedLater = Math.round(conversionAmount * (retirementTaxBracket / 100));
    const netBenefit = taxesSavedLater - taxesPaidNow;
    
    let recommendation = "";
    if (netBenefit > 0) {
      recommendation = `Converting $${conversionAmount.toLocaleString()} to a Roth IRA could save you approximately $${netBenefit.toLocaleString()} in taxes over your lifetime. This conversion makes sense because your current tax bracket (${currentTaxBracket}%) is lower than your expected retirement tax bracket (${retirementTaxBracket}%).`;
    } else {
      recommendation = `Converting to a Roth IRA may not be optimal at this time. You would pay $${taxesPaidNow.toLocaleString()} in taxes now to save $${taxesSavedLater.toLocaleString()} later, resulting in a net cost of $${Math.abs(netBenefit).toLocaleString()}. Consider waiting until your tax bracket is lower.`;
    }
    
    setResult({
      taxesPaidNow,
      taxesSavedLater,
      netBenefit,
      recommendation,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Roth Conversion Calculator</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <DollarSign className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Roth IRA Conversion Analyzer</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Determine if converting your Traditional IRA to a Roth IRA makes financial sense
          </p>
        </div>

        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Conversion Details</CardTitle>
            <CardDescription>
              Enter your current situation and conversion parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age: {currentAge}</Label>
              <Slider
                id="currentAge"
                min={40}
                max={70}
                step={1}
                value={[currentAge]}
                onValueChange={(value) => setCurrentAge(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="traditionalIraBalance">Traditional IRA Balance: ${traditionalIraBalance.toLocaleString()}</Label>
              <Slider
                id="traditionalIraBalance"
                min={50000}
                max={2000000}
                step={10000}
                value={[traditionalIraBalance]}
                onValueChange={(value) => setTraditionalIraBalance(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversionAmount">Amount to Convert: ${conversionAmount.toLocaleString()}</Label>
              <Slider
                id="conversionAmount"
                min={10000}
                max={traditionalIraBalance}
                step={5000}
                value={[conversionAmount]}
                onValueChange={(value) => setConversionAmount(value[0])}
                className="w-full"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentTaxBracket">Current Tax Bracket: {currentTaxBracket}%</Label>
                <Slider
                  id="currentTaxBracket"
                  min={10}
                  max={37}
                  step={1}
                  value={[currentTaxBracket]}
                  onValueChange={(value) => setCurrentTaxBracket(value[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirementTaxBracket">Retirement Tax Bracket: {retirementTaxBracket}%</Label>
                <Slider
                  id="retirementTaxBracket"
                  min={10}
                  max={37}
                  step={1}
                  value={[retirementTaxBracket]}
                  onValueChange={(value) => setRetirementTaxBracket(value[0])}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversionYear">Conversion Year</Label>
              <Input
                id="conversionYear"
                type="number"
                value={conversionYear}
                onChange={(e) => setConversionYear(parseInt(e.target.value))}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 20}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            size="lg"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleQuickCalculate}
          >
            Quick Calculate
          </Button>
          {isAuthenticated && (
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={handleAnalyze}
              disabled={analyzeRoth.isPending}
            >
              {analyzeRoth.isPending ? "Analyzing..." : "Analyze & Save"}
            </Button>
          )}
        </div>

        {/* Results */}
        {result && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.netBenefit > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Taxes Paid Now</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${result.taxesPaidNow.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Taxes Saved Later</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.taxesSavedLater.toLocaleString()}
                  </p>
                </div>

                <div className={`text-center p-4 rounded-lg ${
                  result.netBenefit > 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Net Benefit</p>
                  <p className={`text-2xl font-bold ${
                    result.netBenefit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.netBenefit > 0 ? '+' : ''}${result.netBenefit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg border-l-4 ${
                result.netBenefit > 0 
                  ? 'bg-green-50 border-green-600' 
                  : 'bg-yellow-50 border-yellow-600'
              }`}>
                <div className="flex gap-3">
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    result.netBenefit > 0 ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {result.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Considerations */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Important Considerations</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-indigo-600">•</span>
                    <span>You'll need cash available to pay the conversion taxes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-600">•</span>
                    <span>Converted amounts can be withdrawn tax-free in retirement</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-600">•</span>
                    <span>Roth IRAs have no Required Minimum Distributions (RMDs)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-600">•</span>
                    <span>Consider spreading conversions over multiple years to manage tax brackets</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

