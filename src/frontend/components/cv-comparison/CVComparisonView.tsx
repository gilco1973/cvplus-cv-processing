/**
 * CVPlus CV Processing - CV Comparison View Component
 * 
 * Side-by-side comparison view for CV versions with change highlighting.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { cn } from '@cvplus/core/utils';
import type { CVComparison, CVChange } from '../../hooks/useCVComparison';
import type { CVParsedData } from '../../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface CVComparisonViewProps {
  comparison: CVComparison;
  onAcceptChange?: (changeId: string) => void;
  onRejectChange?: (changeId: string) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CVComparisonView: React.FC<CVComparisonViewProps> = ({
  comparison,
  onAcceptChange,
  onRejectChange,
  className,
}) => {
  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          CV Comparison
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Changes: {comparison.changes.length}</span>
          <span>Score: {Math.round(comparison.improvementScore)}%</span>
          <span>{comparison.createdAt.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {comparison.changes.map((change) => (
            <ChangeCard
              key={change.id}
              change={change}
              onAccept={onAcceptChange}
              onReject={onRejectChange}
            />
          ))}
          
          {comparison.changes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CompareIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No changes detected between CV versions</p>
            </div>
          )}
        </div>
      </div>

      {/* Side by Side View */}
      <div className="border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-auto">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Original</h3>
            <div className="bg-gray-50 rounded p-3 text-sm">
              <CVSummary cvData={comparison.original} />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Modified</h3>
            <div className="bg-blue-50 rounded p-3 text-sm">
              <CVSummary cvData={comparison.modified} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CHANGE CARD COMPONENT
// ============================================================================

interface ChangeCardProps {
  change: CVChange;
  onAccept?: (changeId: string) => void;
  onReject?: (changeId: string) => void;
}

const ChangeCard: React.FC<ChangeCardProps> = ({
  change,
  onAccept,
  onReject,
}) => {
  const getChangeColor = (type: CVChange['type']) => {
    switch (type) {
      case 'added': return 'text-green-600 bg-green-50 border-green-200';
      case 'modified': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'removed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactBadge = (impact: CVChange['impact']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };

    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', colors[impact])}>
        {impact} impact
      </span>
    );
  };

  return (
    <div className={cn('border rounded-lg p-4', getChangeColor(change.type))}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChangeTypeIcon type={change.type} className="w-4 h-4" />
          <span className="font-medium capitalize">{change.type}</span>
          <span className="text-sm opacity-75">in {change.section}</span>
        </div>
        <div className="flex items-center gap-2">
          {getImpactBadge(change.impact)}
        </div>
      </div>

      <p className="text-sm mb-3">{change.description}</p>

      {/* Value Changes */}
      {(change.originalValue || change.newValue) && (
        <div className="space-y-2 mb-3">
          {change.originalValue && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Before:</div>
              <div className="bg-white/50 rounded p-2 text-sm font-mono">
                {typeof change.originalValue === 'string' 
                  ? change.originalValue 
                  : JSON.stringify(change.originalValue, null, 2)}
              </div>
            </div>
          )}
          {change.newValue && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">After:</div>
              <div className="bg-white/50 rounded p-2 text-sm font-mono">
                {typeof change.newValue === 'string' 
                  ? change.newValue 
                  : JSON.stringify(change.newValue, null, 2)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(onAccept || onReject) && (
        <div className="flex gap-2">
          {onAccept && (
            <button
              onClick={() => onAccept(change.id)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Accept
            </button>
          )}
          {onReject && (
            <button
              onClick={() => onReject(change.id)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CV SUMMARY COMPONENT
// ============================================================================

interface CVSummaryProps {
  cvData: CVParsedData;
}

const CVSummary: React.FC<CVSummaryProps> = ({ cvData }) => {
  return (
    <div className="space-y-2">
      <div>
        <strong>Name:</strong> {cvData.personalInfo?.name || 'N/A'}
      </div>
      <div>
        <strong>Title:</strong> {cvData.personalInfo?.title || 'N/A'}
      </div>
      <div>
        <strong>Experience:</strong> {cvData.workExperience?.length || 0} positions
      </div>
      <div>
        <strong>Education:</strong> {cvData.education?.length || 0} entries
      </div>
      <div>
        <strong>Skills:</strong> {cvData.skills?.length || 0} skills
      </div>
      <div>
        <strong>Projects:</strong> {cvData.projects?.length || 0} projects
      </div>
    </div>
  );
};

// ============================================================================
// ICONS
// ============================================================================

const ChangeTypeIcon: React.FC<{ type: CVChange['type']; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'added':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
    case 'modified':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      );
    case 'removed':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
};

const CompareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);