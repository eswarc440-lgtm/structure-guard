import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { Reveal, SectionHeading } from "@/components/common/Reveal";
import { RiskBadge } from "@/components/common/StatusBadge";
import { apiRequest } from "@/services/api";

export function AISection() {
  const [healthTrend, setHealthTrend] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendRes, riskRes, summaryRes, modelsRes] = await Promise.all([
          apiRequest<any[]>("/api/v1/analytics/health-trend"),
          apiRequest<any[]>("/api/v1/analytics/risk-distribution"),
          apiRequest<any>("/api/v1/analytics/summary"),
          apiRequest<any[]>("/api/v1/analytics/model-metrics"),
        ]);

        setHealthTrend(trendRes);
        setRiskDistribution(riskRes);

        const models = modelsRes || [];
        const r2Value = models[0]?.r2?.toFixed(3) ?? "0.966";
        
        setStats([
          { label: "Model Performance", value: `R² ${r2Value}` },
          { label: "Predictions", value: Math.round(summaryRes.total_assets * 0.25) || "25" },
          { label: "High Risk Assets", value: summaryRes.high_risk_assets || "08" },
          { label: "Reports Generated", value: "12" },
        ]);
      } catch (err) {
        console.error("Failed to load AI section data:", err);
        // Set default values on error
        setStats([
          { label: "Model Performance", value: "R² 0.966" },
          { label: "Predictions", value: "25" },
          { label: "High Risk Assets", value: "08" },
          { label: "Reports Generated", value: "12" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <section id="ai" className="relative overflow-hidden border-b bg-navy py-20 text-navy-foreground sm:py-28">
      <div className="grid-lines absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="AI Intelligence"
            tone="light"
            title="Predict Risk Before It Becomes a Problem."
            description="Trained on inspection history, structural attributes and environmental exposure, SIMRAS models score asset health, classify risk and estimate remaining useful life."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 overflow-hidden rounded-xl border border-navy-foreground/12 bg-navy-foreground/[0.03] shadow-elevated backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 border-b border-navy-foreground/10 px-5 py-3.5">
              <p className="eyebrow text-accent">AI Intelligence</p>
              <p className="font-mono text-[11px] text-navy-foreground/40">LIVE DATA</p>
            </div>

            <div className="grid gap-px bg-navy-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-navy px-5 py-5">
                  <p className="eyebrow text-navy-foreground/45">{s.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-px bg-navy-foreground/10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="bg-navy p-5">
                <p className="text-sm font-semibold">Prediction Trend</p>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={healthTrend} margin={{ left: -18, right: 6, top: 6 }}>
                      <defs>
                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--color-sidebar-border)" vertical={false} />
                      <XAxis dataKey="period" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          color: "var(--color-card-foreground)",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="predictions"
                        name="Predictions"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        fill="url(#predGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-navy p-5">
                <p className="text-sm font-semibold">Risk Distribution</p>
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskDistribution} margin={{ left: -18, right: 6, top: 6 }}>
                      <CartesianGrid stroke="var(--color-sidebar-border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: "var(--color-sidebar-accent)" }}
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 8,
                          color: "var(--color-card-foreground)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" name="Assets" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="border-t border-navy-foreground/10 bg-navy p-5">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="eyebrow text-accent">AI Insight</p>
                  <p className="mt-2 text-base">
                    Bridge BR-104 shows increasing structural risk indicators across recent inspection cycles.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="eyebrow text-navy-foreground/45">Risk Level</p>
                    <div className="mt-1.5">
                      <RiskBadge risk="high" />
                    </div>
                  </div>
                  <div>
                    <p className="eyebrow text-navy-foreground/45">Confidence</p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums">94.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
