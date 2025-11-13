export default function Card({ title, children, actions, className = "" }) {
  return (
    <section className={`card card-hover ${className}`}>
      {title && <h3 className="text-lg font-semibold text-secondary-900 mb-4">{title}</h3>}
      <div className="text-secondary-700">{children}</div>
      {actions && <div className="mt-6 flex gap-3">{actions}</div>}
    </section>
  )
}
