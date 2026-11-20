export function Container({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Heading({ title, children, light = false, className = '' }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <h2 className={`text-3xl font-bold leading-tight sm:text-4xl md:text-[2.75rem] ${light ? 'text-white' : 'text-forest-900'}`}>{title}</h2>
      {children && <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-leaf-100' : 'text-ink/75'}`}>{children}</p>}
    </div>
  );
}
