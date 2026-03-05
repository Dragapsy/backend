interface SectionTitleProps {
  title: string
  subtitle: string
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  )
}
