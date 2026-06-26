

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-t-brand-primary border-r-transparent border-b-brand-secondary border-l-transparent`}
      ></div>
      {message && (
        <p className="text-gray-400 text-sm font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
