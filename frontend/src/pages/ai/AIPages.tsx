import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ChartCard, PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { RiskBadge } from "@/components/common/StatusBadge";
import { AITabs } from "@/components/ai/AITabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/services/api";

const riskColors = ["var(--color-success)", "var(--color-warning)", "var(--color-danger)"];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function Shell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="AI Intelligence" title={title} description={description} />
        <AITabs />
        {children}
      </div>
    </DashboardLayout>
  );
}

export function AIOverviewPage() {
  const [healthTrend, setHealthTrend] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendRes, riskRes, predsRes, modelsRes] = await Promise.all([
          apiRequest<any[]>("/api/v1/analytics/health-trend"),
          apiRequest<any[]>("/api/v1/analytics/risk-distribution"),
          apiRequest<any[]>("/api/v1/analytics/predictions?limit=50"),
          apiRequest<any[]>("/api/v1/analytics/model-metrics"),
        ]);
        setHealthTrend(trendRes);
        setRiskDistribution(riskRes);
        setPredictions(predsRes);
        setModels(modelsRes);
      } catch (err) {
        console.error("Failed to load AI overview data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const meanConfidence = predictions.length > 0
    ? (predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length).toFixed(1)
    : "0.0";

  const highRiskCount = predictions.filter(p => p.risk === "high").length;

  return (
    <Shell
      title="AI Intelligence"
      description="Model-driven condition, risk and remaining useful life intelligence across the asset portfolio."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Model R²" value={models[0]?.r2?.toFixed(3) ?? "0.966"} icon={Gauge} tone="accent" delta={`Health Score Model ${models[0]?.version ?? "v3.2.1"}`} />
        <StatCard label="Predictions" value={predictions.length} icon={Sparkles} delta="Latest cycle 09 Aug 2026" />
        <StatCard label="High Risk Assets" value={highRiskCount} icon={ShieldAlert} tone="danger" delta="Escalation review required" />
        <StatCard label="Mean Confidence" value={`${meanConfidence}%`} icon={Activity} tone="success" delta="Across all predictions" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard title="Prediction Volume Trend" subtitle="Predictions generated per month">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="predictions" name="Predictions" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="riskIndex" name="Risk Index" stroke="var(--color-warning)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk Distribution" subtitle="Assets by predicted risk level">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
                  {riskDistribution.map((e, i) => (
                    <Cell key={e.key} fill={riskColors[i % 3]} stroke="var(--color-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="AI Insights" subtitle="Model-generated observations">
        <ul className="grid gap-3 lg:grid-cols-2">
          {predictions.slice(0, 4).map((p) => (
            <li key={p.id} className="rounded-md border bg-surface p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 text-sm font-medium">{p.prediction}</p>
                <RiskBadge risk={p.risk} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.assetName} ({p.assetType})</p>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                {p.assetId} · CONFIDENCE {p.confidence?.toFixed(1) ?? "0.0"}%
              </p>
            </li>
          ))}
        </ul>
      </ChartCard>
    </Shell>
  );
}

export function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiRequest<any[]>("/api/v1/analytics/predictions?limit=100");
        setPredictions(data);
      } catch (err) {
        console.error("Failed to load predictions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Shell title="Predictions" description="Latest model outputs per asset with confidence scoring.">
      <ChartCard title="Prediction Overview" subtitle={`${predictions.length} predictions in the current cycle`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="min-w-[280px]">Prediction</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right">Prediction Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono text-xs">{p.assetId}</span>
                    <span className="block text-sm">{p.assetName}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.prediction}</TableCell>
                  <TableCell>
                    <RiskBadge risk={p.risk} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.confidence?.toFixed(1) ?? "0.0"}%</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{p.predictedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>
    </Shell>
  );
}

export function RiskAnalysisPage() {
  const [healthTrend, setHealthTrend] = useState<any[]>([]);
  const [regionalAnalysis, setRegionalAnalysis] = useState<any[]>([]);
  const [riskSummary, setRiskSummary] = useState<any>(null);
  const [highRiskAssets, setHighRiskAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendRes, regRes, summaryRes, highRiskRes] = await Promise.all([
          apiRequest<any[]>("/api/v1/analytics/health-trend"),
          apiRequest<any[]>("/api/v1/analytics/regional-analysis"),
          apiRequest<any>("/api/v1/analytics/summary"),
          apiRequest<any>("/api/v1/analytics/high-risk"),
        ]);
        setHealthTrend(trendRes);
        setRegionalAnalysis(regRes);
        setRiskSummary(summaryRes);
        setHighRiskAssets(highRiskRes || []);
      } catch (err) {
        console.error("Failed to load risk analysis data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Shell title="Risk Analysis" description="Structural risk classification, concentration and trend analysis.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="High Risk" value={riskSummary?.high_risk_assets ?? 0} tone="danger" icon={ShieldAlert} delta="Immediate review" />
        <StatCard label="Medium Risk" value={riskSummary?.medium_risk_assets ?? 0} tone="warning" icon={Activity} delta="Monitor closely" />
        <StatCard label="Low Risk" value={riskSummary?.low_risk_assets ?? 0} tone="success" icon={Gauge} delta="Routine cycle" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Risk Index by Region" subtitle="Higher index indicates greater structural exposure">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalAnalysis} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="riskIndex" name="Risk index" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk Trend" subtitle="Portfolio risk index over time">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="riskIndex" name="Risk index" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="High Risk Register" subtitle="Assets exceeding the high-risk threshold">
        <ul className="divide-y">
          {highRiskAssets.slice(0, 10).map((a) => (
            <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 first:pt-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {a.id} · {a.type} · {a.district}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="hidden w-32 sm:block">
                  <Progress value={Math.min(a.risk_score || 0, 100)} />
                </div>
                <RiskBadge risk={a.risk_level ? (a.risk_level.toLowerCase().includes("high") ? "high" : a.risk_level.toLowerCase().includes("medium") ? "medium" : "low") : "low"} />
              </div>
            </li>
          ))}
        </ul>
      </ChartCard>
    </Shell>
  );
}

export function ModelPerformancePage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiRequest<any[]>("/api/v1/analytics/model-metrics");
        setModels(data);
      } catch (err) {
        console.error("Failed to load model metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const modelEvaluation = [
    { epoch: 1, actual: 65, predicted: 62 },
    { epoch: 2, actual: 72, predicted: 70 },
    { epoch: 3, actual: 78, predicted: 79 },
    { epoch: 4, actual: 82, predicted: 83 },
    { epoch: 5, actual: 85, predicted: 86 },
  ];

  return (
    <Shell title="Model Performance" description="Evaluation metrics for the deployed SIMRAS model suite.">
      <div className="grid gap-4 lg:grid-cols-3">
        {models.map((m) => (
          <div key={m.name} className="rounded-lg border bg-card p-5 shadow-panel">
            <p className="text-sm font-semibold">{m.name}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {m.version} · TRAINED {m.trainedAt.toUpperCase()}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              {[
                { k: "R²", v: m.r2?.toFixed(3) ?? "0.000" },
                { k: "MAE", v: m.mae?.toFixed(2) ?? "0.00" },
                { k: "RMSE", v: m.rmse?.toFixed(2) ?? "0.00" },
              ].map((item) => (
                <div key={item.k}>
                  <dt className="eyebrow text-muted-foreground">{item.k}</dt>
                  <dd className="mt-1 font-display text-xl font-bold tabular-nums">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <ChartCard title="Evaluation — Predicted vs Actual" subtitle="Validation set performance">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modelEvaluation} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="epoch" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </Shell>
  );
}


const riskColors = ["var(--color-success)", "var(--color-warning)", "var(--color-danger)"];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

function Shell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader eyebrow="AI Intelligence" title={title} description={description} />
        <AITabs />
        {children}
      </div>
    </DashboardLayout>
  );
}

export function AIOverviewPage() {
  return (
    <Shell
      title="AI Intelligence"
      description="Model-driven condition, risk and remaining useful life intelligence across the asset portfolio."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Model R²" value="0.966" icon={Gauge} tone="accent" delta="Health Score Model v3.2.1" />
        <StatCard label="Predictions" value={predictions.length} icon={Sparkles} delta="Latest cycle 09 Aug 2026" />
        <StatCard label="High Risk Assets" value="08" icon={ShieldAlert} tone="danger" delta="Escalation review required" />
        <StatCard label="Mean Confidence" value="89.4%" icon={Activity} tone="success" delta="Across all predictions" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard title="Prediction Volume Trend" subtitle="Predictions generated per month">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="predictions" name="Predictions" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="riskIndex" name="Risk Index" stroke="var(--color-warning)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk Distribution" subtitle="Assets by predicted risk level">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
                  {riskDistribution.map((e, i) => (
                    <Cell key={e.key} fill={riskColors[i]} stroke="var(--color-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="AI Insights" subtitle="Model-generated observations">
        <ul className="grid gap-3 lg:grid-cols-2">
          {insights.map((i) => (
            <li key={i.id} className="rounded-md border bg-surface p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <p className="min-w-0 text-sm font-medium">{i.title}</p>
                <RiskBadge risk={i.risk} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                {i.assetId} · CONFIDENCE {i.confidence.toFixed(1)}%
              </p>
            </li>
          ))}
        </ul>
      </ChartCard>
    </Shell>
  );
}

export function PredictionsPage() {
  return (
    <Shell title="Predictions" description="Latest model outputs per asset with confidence scoring.">
      <ChartCard title="Prediction Overview" subtitle={`${predictions.length} predictions in the current cycle`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="min-w-[280px]">Prediction</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right">Prediction Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono text-xs">{p.assetId}</span>
                    <span className="block text-sm">{p.assetName}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.prediction}</TableCell>
                  <TableCell>
                    <RiskBadge risk={p.risk} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{p.confidence.toFixed(1)}%</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{p.predictedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>
    </Shell>
  );
}

export function RiskAnalysisPage() {
  const byRisk = (level: "high" | "medium" | "low") => assets.filter((a) => a.risk === level);
  return (
    <Shell title="Risk Analysis" description="Structural risk classification, concentration and trend analysis.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="High Risk" value={byRisk("high").length} tone="danger" icon={ShieldAlert} delta="Immediate review" />
        <StatCard label="Medium Risk" value={byRisk("medium").length} tone="warning" icon={Activity} delta="Monitor closely" />
        <StatCard label="Low Risk" value={byRisk("low").length} tone="success" icon={Gauge} delta="Routine cycle" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Risk Index by Region" subtitle="Higher index indicates greater structural exposure">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalAnalysis} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="riskIndex" name="Risk index" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk Trend" subtitle="Portfolio risk index over time">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthTrend} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="riskIndex" name="Risk index" stroke="var(--color-danger)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="High Risk Register" subtitle="Assets exceeding the high-risk threshold">
        <ul className="divide-y">
          {byRisk("high").map((a) => (
            <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 first:pt-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {a.id} · {a.type} · {a.location}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="hidden w-32 sm:block">
                  <Progress value={a.riskScore} />
                </div>
                <RiskBadge risk={a.risk} />
              </div>
            </li>
          ))}
        </ul>
      </ChartCard>
    </Shell>
  );
}

export function ModelPerformancePage() {
  return (
    <Shell title="Model Performance" description="Evaluation metrics for the deployed SIMRAS model suite.">
      <div className="grid gap-4 lg:grid-cols-3">
        {models.map((m) => (
          <div key={m.name} className="rounded-lg border bg-card p-5 shadow-panel">
            <p className="text-sm font-semibold">{m.name}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {m.version} · TRAINED {m.trainedAt.toUpperCase()}
            </p>
            <dl className="mt-5 grid grid-cols-3 gap-3">
              {[
                { k: "R²", v: m.r2.toFixed(3) },
                { k: "MAE", v: m.mae.toFixed(2) },
                { k: "RMSE", v: m.rmse.toFixed(2) },
              ].map((item) => (
                <div key={item.k}>
                  <dt className="eyebrow text-muted-foreground">{item.k}</dt>
                  <dd className="mt-1 font-display text-xl font-bold tabular-nums">{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <ChartCard title="Evaluation — Predicted vs Actual" subtitle="Validation set performance">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={modelEvaluation} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="epoch" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="var(--color-primary)" strokeWidth={2} />
              <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="5 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </Shell>
  );
}
