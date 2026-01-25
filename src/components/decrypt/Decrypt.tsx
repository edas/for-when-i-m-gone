interface DecryptProps {
  onBack: () => void;
}

export function Decrypt({ onBack }: DecryptProps) {
  return (
    <div>
      <h1>Not implemented</h1>
      <button onClick={onBack}>Return</button>
    </div>
  );
}