interface ModePlaceholderProps {
  onBack: () => void;
}

export function ModePlaceholder({ onBack }: ModePlaceholderProps) {
  return (
    <div>
      <h1>Not implemented</h1>
      <button onClick={onBack}>Return</button>
    </div>
  );
}
