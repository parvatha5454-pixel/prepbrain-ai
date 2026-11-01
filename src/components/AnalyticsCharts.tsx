'use client'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
type T = { topic: string; current: number; previous: number | null }
type D = { day: string; accuracy: number | null; minutes: number }
const Box = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="glass p-4"><h2 className="mb-3 font-semibold">{title}</h2><div className="h-64">{children}</div></section>
export default function AnalyticsCharts({ topics, daily }: { topics: T[]; daily: D[] }) {
  const tip = { contentStyle: { background: '#0b1026', border: '1px solid #ffffff22' } }
  return (
    <div className="space-y-4">
      <Box title="Topic mastery (previous vs current)">
        {topics.length === 0 ? <p className="text-sm opacity-60">No mastery data yet.</p> :
          <ResponsiveContainer><BarChart data={topics}><CartesianGrid strokeOpacity={0.1} /><XAxis dataKey="topic" stroke="#aaa" /><YAxis domain={[0, 100]} stroke="#aaa" /><Tooltip {...tip} /><Legend />
            <Bar dataKey="previous" name="Previous" fill="#64748b" /><Bar dataKey="current" name="Current" fill="#8b5cf6" /></BarChart></ResponsiveContainer>}
      </Box>
      <Box title="Accuracy trend (last 7 days)">
        {daily.every(d => d.accuracy === null) ? <p className="text-sm opacity-60">No quiz answers in the last 7 days. Take an assessment to see your trend.</p> :
          <ResponsiveContainer><LineChart data={daily}><CartesianGrid strokeOpacity={0.1} /><XAxis dataKey="day" stroke="#aaa" /><YAxis domain={[0, 100]} stroke="#aaa" /><Tooltip {...tip} />
            <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#22d3ee" strokeWidth={2} connectNulls /></LineChart></ResponsiveContainer>}
      </Box>
      <Box title="Study time (minutes, last 7 days)">
        {daily.every(d => d.minutes === 0) ? <p className="text-sm opacity-60">No study time logged in the last 7 days.</p> :
          <ResponsiveContainer><BarChart data={daily}><CartesianGrid strokeOpacity={0.1} /><XAxis dataKey="day" stroke="#aaa" /><YAxis stroke="#aaa" /><Tooltip {...tip} /><Bar dataKey="minutes" name="Minutes" fill="#a78bfa" /></BarChart></ResponsiveContainer>}
      </Box>
    </div>
  )
}
