/**
 * CVPlus CV Processing - CV Preview Toolbar Component
 * 
 * Toolbar component for CV preview with actions like zoom, export, and edit modes.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { cn } from '@cvplus/core/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CVPreviewToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleEditMode: () => void;
  onExport: () => void;
  onPrint: () => void;
  zoom: number;
  isEditMode: boolean;
  isExporting?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CVPreviewToolbar: React.FC<CVPreviewToolbarProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleEditMode,
  onExport,
  onPrint,
  zoom,
  isEditMode,
  isExporting = false,
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-2 p-2 bg-white border-b border-gray-200',
      className
    )}>
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
        <button
          onClick={onZoomOut}
          disabled={zoom <= 0.5}
          className={cn(
            'p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          title="Zoom Out"
        >
          <ZoomOutIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={onResetZoom}
          className={cn(
            'px-3 py-1 text-sm font-mono bg-gray-50 rounded hover:bg-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        
        <button
          onClick={onZoomIn}
          disabled={zoom >= 2}
          className={cn(
            'p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
          title="Zoom In"
        >
          <ZoomInIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Edit Mode Toggle */}
      <button
        onClick={onToggleEditMode}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded text-sm font-medium',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          isEditMode
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        <EditIcon className="w-4 h-4" />
        {isEditMode ? 'Exit Edit' : 'Edit Mode'}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrint}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium',
            'bg-gray-100 text-gray-700 rounded hover:bg-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          <PrintIcon className="w-4 h-4" />
          Print
        </button>

        <button
          onClick={onExport}
          disabled={isExporting}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm font-medium',
            'bg-blue-600 text-white rounded hover:bg-blue-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isExporting ? (
            <>
              <LoadingIcon className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <ExportIcon className="w-4 h-4" />
              Export
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// ICONS
// ============================================================================

const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
  </svg>
);

const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const ExportIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LoadingIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);