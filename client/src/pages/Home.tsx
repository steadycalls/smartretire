import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Shield, Zap, CheckCircle, ArrowRight, DollarSign, Calendar, PieChart } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Calculator,
      title: "Smart Calculations",
      description: "AI-powered analysis of your retirement income sources and optimal withdrawal strategies"
    },
    {
      icon: TrendingUp,
      title: "Social Security Optimization",
      description: "Determine the best age to claim benefits for maximum lifetime income"
    },
    {
      icon: Shield,
      title: "Tax Efficiency",
      description: "Minimize tax burden with intelligent withdrawal sequencing strategies"
    },
    {
      icon: Zap,
      title: "Real-Time Projections",
      description: "See instant Monte Carlo simulations of your retirement income scenarios"
    }
  ];

  const benefits = [
    "Optimize Social Security claiming strategy",
    "Tax-efficient withdrawal planning",
    "Longevity risk assessment",
    "Healthcare cost projections",
    "RMD planning and automation",
    "Inflation-adjusted income modeling"
  ];

  const stats = [
    { value: "10,000", label: "Boomers retiring daily", icon: Calendar },
    { value: "$50K+", label: "Avg. optimization value", icon: DollarSign },
    { value: "30+ yrs", label: "Retirement planning horizon", icon: PieChart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-8 shadow-lg">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Maximize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Retirement Income</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered retirement income optimizer that helps you make smarter decisions about 
              Social Security, withdrawals, and tax strategies—potentially adding tens of thousands 
              to your lifetime income.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={() => setLocation('/calculator')}
              >
                Start Free Analysis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-6 text-lg border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>100% free calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Privacy protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-4">
                  <stat.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Intelligent Retirement Planning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your unique situation to provide personalized recommendations 
              that maximize your retirement income
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Everything You Need to Retire Confidently
              </h2>
              <p className="text-xl text-indigo-100">
                Comprehensive analysis covering all aspects of retirement income planning
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                  <span className="text-white font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized retirement income recommendations in three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Info</h3>
                <p className="text-gray-600">
                  Provide basic details about your age, savings, and expected expenses
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI analyzes thousands of scenarios to optimize your retirement strategy
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Recommendations</h3>
                <p className="text-gray-600">
                  Receive personalized strategies to maximize your retirement income
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
            <CardContent className="p-12 text-center relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">
                  Ready to Optimize Your Retirement?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of pre-retirees who have discovered how to maximize their 
                  retirement income with SmartRetire's AI-powered analysis.
                </p>
                <Button 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg shadow-lg"
                  onClick={() => setLocation('/calculator')}
                >
                  Start Your Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-gray-400 mt-4">
                  Takes less than 5 minutes • No credit card required
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Disclaimer:</strong> SmartRetire provides educational estimates and should not be considered financial advice. 
              Consult with a qualified financial advisor for personalized retirement planning.
            </p>
            <p>© 2025 SmartRetire. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

