/**
 * CVPlus CV Processing - QR Code Editor Component
 * 
 * Editor component for customizing QR codes in CVs.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@cvplus/core/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface QRCodeSettings {
  url: string;
  size: number;
  color: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  logoUrl?: string;
  logoSize?: number;
}

export interface QRCodeEditorProps {
  settings: QRCodeSettings;
  onSettingsChange: (settings: QRCodeSettings) => void;
  onClose: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const QRCodeEditor: React.FC<QRCodeEditorProps> = ({
  settings,
  onSettingsChange,
  onClose,
  className,
}) => {
  const [localSettings, setLocalSettings] = useState<QRCodeSettings>(settings);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Generate preview URL (mock implementation)
  useEffect(() => {
    const generatePreview = () => {
      // In a real implementation, this would call a QR code generation service
      const mockPreview = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
      setPreviewUrl(mockPreview);
    };

    generatePreview();
  }, [localSettings]);

  const handleSettingChange = useCallback((key: keyof QRCodeSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  }, [localSettings, onSettingsChange]);

  const handleSave = useCallback(() => {
    onSettingsChange(localSettings);
    onClose();
  }, [localSettings, onSettingsChange, onClose]);

  return (
    <div className={cn(
      'bg-white border border-gray-300 rounded-lg shadow-lg w-96',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          QR Code Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="flex justify-center p-4 bg-gray-50 rounded border">
            {previewUrl ? (
              <div
                className="border"
                style={{
                  width: `${localSettings.size}px`,
                  height: `${localSettings.size}px`,
                  backgroundColor: localSettings.backgroundColor,
                }}
              >
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
                  QR Preview
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-sm">No preview</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings Form */}
        <div className="space-y-4">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              value={localSettings.url}
              onChange={(e) => handleSettingChange('url', e.target.value)}
              placeholder="https://your-profile-url.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size: {localSettings.size}px
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={localSettings.size}
              onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localSettings.color}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={localSettings.color}
                  onChange={(e) => handleSettingChange('color', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localSettings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={localSettings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Error Correction Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Error Correction Level
            </label>
            <select
              value={localSettings.errorCorrectionLevel}
              onChange={(e) => handleSettingChange('errorCorrectionLevel', e.target.value as QRCodeSettings['errorCorrectionLevel'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Low (~7%)</option>
              <option value="M">Medium (~15%)</option>
              <option value="Q">Quartile (~25%)</option>
              <option value="H">High (~30%)</option>
            </select>
          </div>

          {/* Include Margin */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeMargin"
              checked={localSettings.includeMargin}
              onChange={(e) => handleSettingChange('includeMargin', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="includeMargin" className="ml-2 text-sm text-gray-700">
              Include margin around QR code
            </label>
          </div>

          {/* Logo Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL (optional)
            </label>
            <input
              type="url"
              value={localSettings.logoUrl || ''}
              onChange={(e) => handleSettingChange('logoUrl', e.target.value || undefined)}
              placeholder="https://your-logo-url.com/logo.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {localSettings.logoUrl && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo Size: {localSettings.logoSize || 20}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={localSettings.logoSize || 20}
                  onChange={(e) => handleSettingChange('logoSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ICONS
// ============================================================================

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);