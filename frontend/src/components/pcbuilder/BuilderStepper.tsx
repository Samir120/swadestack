import React from 'react';
import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  MonitorPlay,
  HardDrive,
  Database,
  Zap,
  Server,
  Fan,
  Disc,
  AppWindow,
  type LucideIcon,
} from '../common/icons';
import { ComponentType } from '../../models/types/pcComponent.types';

/**
 * Builder Stepper Component
 * Visual step indicator for PC Builder progress
 */

interface Step {
  type: ComponentType;
  label: string;
  required: boolean;
  conditionallyRequired?: boolean; // Yellow asterisk - required for build service
  status: 'pending' | 'current' | 'completed';
}

interface BuilderStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

// Component type icons using Lucide
const COMPONENT_ICONS: Record<ComponentType, LucideIcon> = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  gpu: MonitorPlay,
  ssd: HardDrive,
  hdd: Database,
  psu: Zap,
  case: Server,
  cooling: Fan,
  optical: Disc,
  fan: Fan,
  os: AppWindow,
};

const BuilderStepper: React.FC<BuilderStepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="bg-white dark:bg-surface-850 rounded-lg shadow-light-md dark:shadow-dark-md p-4">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.type}>
            {/* Step Item */}
            <button
              onClick={() => onStepClick(index)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all cursor-pointer
                ${step.status === 'current' ? 'bg-blue-50 ring-2 ring-blue-500' : ''}
                ${step.status === 'completed' ? 'hover:bg-green-900/20' : 'hover:bg-gray-200 dark:hover:bg-surface-700'}
              `}
            >
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-colors
                  ${step.status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${step.status === 'current' ? 'bg-blue-500 text-white' : ''}
                  ${step.status === 'pending' ? 'bg-gray-200 dark:bg-surface-700 text-gray-500 dark:text-neutral-400' : ''}
                `}
              >
                {step.status === 'completed' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  React.createElement(COMPONENT_ICONS[step.type], { size: 18, strokeWidth: 1.5 })
                )}
              </div>

              {/* Step Label */}
              <span
                className={`
                  mt-1 text-xs font-medium uppercase tracking-wide
                  ${step.status === 'completed' ? 'text-green-600' : ''}
                  ${step.status === 'current' ? 'text-blue-600' : ''}
                  ${step.status === 'pending' ? 'text-gray-400 dark:text-neutral-500' : ''}
                `}
              >
                {step.label}
              </span>

              {/* Required Badge - Red for required, Yellow for conditionally required */}
              {step.required && step.status !== 'completed' && (
                <span className="text-[10px] text-red-500">*</span>
              )}
              {step.conditionallyRequired && !step.required && step.status !== 'completed' && (
                <span className="text-[10px] text-yellow-500" title="Required for build service">*</span>
              )}
            </button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-1
                  ${steps[index + 1].status === 'completed' || step.status === 'completed'
                    ? 'bg-green-500/40'
                    : 'bg-gray-200 dark:bg-surface-700'
                  }
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500 dark:text-neutral-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
            {steps[currentStep]?.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-surface-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Mobile Step Dots */}
        <div className="flex justify-center mt-4 gap-2">
          {steps.map((step, index) => (
            <button
              key={step.type}
              onClick={() => onStepClick(index)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${step.status === 'completed' ? 'bg-green-500' : ''}
                ${step.status === 'current' ? 'bg-blue-500 scale-125' : ''}
                ${step.status === 'pending' ? 'bg-gray-300 dark:bg-surface-600' : ''}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuilderStepper;
