export default function Loading() {
  return <main className="mx-auto max-w-5xl space-y-4 p-6"><div className="shimmer h-12 w-64" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="shimmer h-28" />)}</div><div className="shimmer h-36" /><div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map(i => <div key={i} className="shimmer h-32" />)}</div></main>
}
