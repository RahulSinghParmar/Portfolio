type SectionLabelProps = {
  index: string;
  children: React.ReactNode;
};

export function SectionLabel({ index, children }: SectionLabelProps) {
  return (
    <p className="section-label">
      <span>{index}</span>
      {children}
    </p>
  );
}
