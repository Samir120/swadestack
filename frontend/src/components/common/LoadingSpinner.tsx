import Lottie from 'lottie-react';
import loadingSpinnerAnimation from '../../assets/animations/loading-spinner.json';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10 sm:w-12 sm:h-12',
  lg: 'w-16 h-16',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => (
  <div className={`${sizeClasses[size]} mx-auto ${className}`.trim()}>
    <Lottie animationData={loadingSpinnerAnimation} loop />
  </div>
);

export default LoadingSpinner;
