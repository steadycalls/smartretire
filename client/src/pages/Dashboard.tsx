import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  FileText,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [selectedScenarios, setSelectedScenarios] = useState<number[]>([]);

  const { data: scenarios, isLoading, refetch } = trpc.scenarios.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteScenario = trpc.scenarios.delete.useMutation({
    onSuccess: () => {
      toast.success("Scenario deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete scenario: " + error.message);
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this scenario?")) {
      deleteScenario.mutate({ id });
    }
  };

  const handleCompare = () => {
    if (selectedScenarios.length < 2) {
      toast.error("Please select at least 2 scenarios to compare");
      return;
    }
    setLocation(`/compare?ids=${selectedScenarios.join(',')}`);
  };

  const toggleScenarioSelection = (id: number) => {
    setSelectedScenarios(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const getReadinessColor = (score: number | null) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessLabel = (score: number | null) => {
    if (!score) return "Not calculated";
    if (score >= 80) return "On Track";
    if (score >= 60) return "Needs Attention";
    return "At Risk";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              Please login to access your retirement scenarios dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold text-gray-900">My Scenarios</h1>
          <Button 
            onClick={() => setLocation('/calculator')}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'User'}!</h2>
          <p className="text-gray-600">
            Manage your retirement scenarios and track your progress toward financial independence
          </p>
        </div>

        {/* Quick Actions */}
        {selectedScenarios.length > 0 && (
          <Card className="mb-6 bg-indigo-50 border-indigo-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-900">
                  {selectedScenarios.length} scenario(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScenarios([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCompare}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare Scenarios
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scenarios Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your scenarios...</p>
          </div>
        ) : scenarios && scenarios.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  selectedScenarios.includes(scenario.id) 
                    ? 'ring-2 ring-indigo-600 bg-indigo-50' 
                    : ''
                }`}
                onClick={() => toggleScenarioSelection(scenario.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{scenario.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Updated {new Date(scenario.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className={`text-2xl font-bold ${getReadinessColor(scenario.readinessScore)}`}>
                      {scenario.readinessScore || '--'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${getReadinessColor(scenario.readinessScore)}`}>
                      {getReadinessLabel(scenario.readinessScore)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Retire at {scenario.retirementAge}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${scenario.currentSavings.toLocaleString()} saved</span>
                  </div>

                  {scenario.hasSpouse === 1 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Joint planning</span>
                    </div>
                  )}

                  {scenario.projectedShortfall && scenario.projectedShortfall > 0 && (
                    <div className="text-sm text-red-600 font-medium">
                      Shortfall: ${Math.abs(scenario.projectedShortfall).toLocaleString()}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/results?scenarioId=${scenario.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(scenario.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No scenarios yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first retirement scenario to get started with personalized recommendations
              </p>
              <Button
                onClick={() => setLocation('/calculator')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Scenario
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Additional Tools */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setLocation('/roth-calculator')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Roth Conversion Calculator
              </CardTitle>
              <CardDescription>
                Analyze whether converting to a Roth IRA makes sense for your situation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => toast.info("Coming soon!")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Generate Report
              </CardTitle>
              <CardDescription>
                Download a comprehensive PDF report of your retirement analysis
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}

