import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  audienceActivityTrend,
  contentPreferenceData,
  engagementTrend,
  retentionTrend,
  retentionVsChurn,
  returningViewerTrend,
  riskDistribution,
  watchTimeTrend,
} from "@/lib/data";

const pieColors = ["#22c55e", "#f59e0b", "#f97316", "#ef4444"];

export function AudienceActivityChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={audienceActivityTrend}>
          <defs>
            <linearGradient id="audienceFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toLocaleString()} active`, "Audience"];
            }}
          />
          <Area type="monotone" dataKey="active" stroke="#38bdf8" strokeWidth={3} fill="url(#audienceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WatchTimeChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={watchTimeTrend}>
          <defs>
            <linearGradient id="watchFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toFixed(1)} min`, "Watch time"];
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fill="url(#watchFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EngagementTrendChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={engagementTrend}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[4, 9]} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toFixed(1)}%`, "Engagement"];
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskDistributionChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={3}>
            {riskDistribution.map((entry, index) => (
              <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toFixed(0)}%`, "Viewers"];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReturningViewerTrendChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={returningViewerTrend}>
          <defs>
            <linearGradient id="returnFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[35, 65]} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toFixed(0)}%`, "Returning viewers"];
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={3} fill="url(#returnFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RetentionVsChurnChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <ComposedChart data={retentionVsChurn}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="period" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[40, 90]} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value, name) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              const label = name === "retention" ? "Retention" : "Churn risk";
              return [`${numeric.toFixed(0)}%`, label];
            }}
          />
          <Area type="monotone" dataKey="retention" fill="#38bdf8" stroke="#38bdf8" fillOpacity={0.15} />
          <Line type="monotone" dataKey="churn" stroke="#f97316" strokeWidth={3} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RetentionChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={retentionTrend}>
          <defs>
            <linearGradient id="retentionFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[55, 85]} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toFixed(0)}%`, "Retention"];
            }}
          />
          <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fill="url(#retentionFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PreferenceChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={contentPreferenceData} layout="vertical" margin={{ left: 10, right: 10 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false} />
          <YAxis dataKey="category" type="category" stroke="#94a3b8" axisLine={false} tickLine={false} width={92} />
          <Tooltip
            contentStyle={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 12 }}
            formatter={(value) => {
              const numeric = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
              return [`${numeric.toFixed(0)} viewers`, "Audience"];
            }}
          />
          <Bar dataKey="viewers" radius={[0, 8, 8, 0]} fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
