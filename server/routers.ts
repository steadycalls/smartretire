import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Retirement Scenarios router
  scenarios: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserScenarios(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getScenarioById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        currentAge: z.number(),
        retirementAge: z.number(),
        lifeExpectancy: z.number(),
        currentSavings: z.number(),
        monthlyExpenses: z.number(),
        socialSecurityAge: z.number(),
        estimatedSocialSecurity: z.number(),
        hasSpouse: z.number().optional(),
        spouseAge: z.number().optional(),
        spouseRetirementAge: z.number().optional(),
        spouseSocialSecurityAge: z.number().optional(),
        spouseSocialSecurity: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Calculate readiness score and projections using AI
        const analysis = await analyzeRetirementScenario(input);
        
        await db.createScenario({
          userId: ctx.user.id,
          ...input,
          hasSpouse: input.hasSpouse || 0,
          readinessScore: analysis.readinessScore,
          projectedShortfall: analysis.projectedShortfall,
        });
        
        return { success: true, analysis };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        currentAge: z.number().optional(),
        retirementAge: z.number().optional(),
        lifeExpectancy: z.number().optional(),
        currentSavings: z.number().optional(),
        monthlyExpenses: z.number().optional(),
        socialSecurityAge: z.number().optional(),
        estimatedSocialSecurity: z.number().optional(),
        hasSpouse: z.number().optional(),
        spouseAge: z.number().optional(),
        spouseRetirementAge: z.number().optional(),
        spouseSocialSecurityAge: z.number().optional(),
        spouseSocialSecurity: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateScenario(id, ctx.user.id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteScenario(input.id, ctx.user.id);
        return { success: true };
      }),
    
    compare: protectedProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .query(async ({ ctx, input }) => {
        const scenarios = await Promise.all(
          input.ids.map(id => db.getScenarioById(id, ctx.user.id))
        );
        return scenarios.filter(s => s !== null);
      }),
  }),
  
  // Roth Conversion router
  roth: router({
    analyze: protectedProcedure
      .input(z.object({
        currentAge: z.number(),
        traditionalIraBalance: z.number(),
        currentTaxBracket: z.number(),
        retirementTaxBracket: z.number(),
        conversionAmount: z.number(),
        conversionYear: z.number(),
        scenarioId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Calculate Roth conversion benefits
        const analysis = await analyzeRothConversion(input);
        
        await db.createRothConversion({
          userId: ctx.user.id,
          ...input,
          ...analysis,
        });
        
        return analysis;
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserRothConversions(ctx.user.id);
    }),
  }),
  
  // Email/PDF Report generation
  reports: router({
    generate: protectedProcedure
      .input(z.object({ scenarioId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const scenario = await db.getScenarioById(input.scenarioId, ctx.user.id);
        if (!scenario) throw new Error("Scenario not found");
        
        // Generate AI-powered recommendations
        const recommendations = await generateRecommendations(scenario);
        
        return {
          scenario,
          recommendations,
          generatedAt: new Date(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;



// Helper functions for AI-powered analysis
async function analyzeRetirementScenario(input: any) {
  const yearsToRetirement = input.retirementAge - input.currentAge;
  const yearsInRetirement = input.lifeExpectancy - input.retirementAge;
  const totalRetirementExpenses = input.monthlyExpenses * 12 * yearsInRetirement;
  const socialSecurityIncome = input.estimatedSocialSecurity * 12 * (input.lifeExpectancy - input.socialSecurityAge);
  
  let spouseSSIncome = 0;
  if (input.hasSpouse && input.spouseSocialSecurity && input.spouseSocialSecurityAge) {
    spouseSSIncome = input.spouseSocialSecurity * 12 * (input.lifeExpectancy - input.spouseSocialSecurityAge);
  }
  
  const totalIncome = input.currentSavings + socialSecurityIncome + spouseSSIncome;
  const shortfall = totalRetirementExpenses - totalIncome;
  
  // Calculate readiness score (0-100)
  const ratio = totalIncome / totalRetirementExpenses;
  let readinessScore = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  
  return {
    readinessScore,
    projectedShortfall: Math.round(shortfall),
  };
}

async function analyzeRothConversion(input: any) {
  const taxesPaidNow = Math.round(input.conversionAmount * (input.currentTaxBracket / 100));
  const taxesSavedLater = Math.round(input.conversionAmount * (input.retirementTaxBracket / 100));
  const netBenefit = taxesSavedLater - taxesPaidNow;
  
  let recommendation = "";
  if (netBenefit > 0) {
    recommendation = `Converting $${input.conversionAmount.toLocaleString()} to a Roth IRA could save you approximately $${netBenefit.toLocaleString()} in taxes over your lifetime. This conversion makes sense because your current tax bracket (${input.currentTaxBracket}%) is lower than your expected retirement tax bracket (${input.retirementTaxBracket}%).`;
  } else {
    recommendation = `Converting to a Roth IRA may not be optimal at this time. You would pay $${taxesPaidNow.toLocaleString()} in taxes now to save $${taxesSavedLater.toLocaleString()} later, resulting in a net cost of $${Math.abs(netBenefit).toLocaleString()}. Consider waiting until your tax bracket is lower.`;
  }
  
  return {
    taxesPaidNow,
    taxesSavedLater,
    netBenefit,
    recommendation,
  };
}

async function generateRecommendations(scenario: any) {
  const prompt = `You are a retirement planning expert. Analyze this retirement scenario and provide 5 specific, actionable recommendations:

Current Age: ${scenario.currentAge}
Retirement Age: ${scenario.retirementAge}
Life Expectancy: ${scenario.lifeExpectancy}
Current Savings: $${scenario.currentSavings.toLocaleString()}
Monthly Expenses: $${scenario.monthlyExpenses.toLocaleString()}
Social Security Age: ${scenario.socialSecurityAge}
Estimated Social Security: $${scenario.estimatedSocialSecurity.toLocaleString()}/month
Readiness Score: ${scenario.readinessScore}/100
Projected Shortfall: $${scenario.projectedShortfall?.toLocaleString() || 0}

${scenario.hasSpouse ? `Spouse Age: ${scenario.spouseAge}
Spouse Retirement Age: ${scenario.spouseRetirementAge}
Spouse Social Security Age: ${scenario.spouseSocialSecurityAge}
Spouse Social Security: $${scenario.spouseSocialSecurity?.toLocaleString()}/month` : ''}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed explanation",
      "impact": "High/Medium/Low",
      "category": "Social Security/Tax Strategy/Savings/Healthcare/RMD"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a retirement planning expert. Provide specific, actionable advice." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "retirement_recommendations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string", enum: ["High", "Medium", "Low"] },
                  category: { type: "string" }
                },
                required: ["title", "description", "impact", "category"],
                additionalProperties: false
              }
            }
          },
          required: ["recommendations"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  if (typeof content === 'string') {
    return JSON.parse(content || "{}");
  }
  return { recommendations: [] };
}

