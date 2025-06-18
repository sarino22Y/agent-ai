interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded">
      {message}
    </div>
  );
}