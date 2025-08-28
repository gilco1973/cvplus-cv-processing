/**
 * CVPlus CV Processing - Section Editor Component
 * 
 * Inline editor component for CV sections with field-level editing.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@cvplus/core/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface SectionEditorProps {
  section: string;
  data: any;
  onSave: (section: string, data: any) => void;
  onCancel: () => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  data,
  onSave,
  onCancel,
  className,
}) => {
  const [editedData, setEditedData] = useState(data);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave(section, editedData);
    } finally {
      setIsLoading(false);
    }
  }, [section, editedData, onSave]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const renderEditor = () => {
    switch (section) {
      case 'personalInfo':
        return <PersonalInfoEditor data={editedData} onChange={handleFieldChange} />;
      case 'summary':
        return <SummaryEditor data={editedData} onChange={setEditedData} />;
      case 'skills':
        return <SkillsEditor data={editedData} onChange={setEditedData} />;
      case 'workExperience':
        return <WorkExperienceEditor data={editedData} onChange={setEditedData} />;
      case 'education':
        return <EducationEditor data={editedData} onChange={setEditedData} />;
      case 'projects':
        return <ProjectsEditor data={editedData} onChange={setEditedData} />;
      default:
        return <GenericEditor data={editedData} onChange={setEditedData} />;
    }
  };

  return (
    <div className={cn('bg-white border border-blue-300 rounded-lg shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          Edit {section.replace(/([A-Z])/g, ' $1').trim()}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
            )}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-auto">
        {renderEditor()}
      </div>
    </div>
  );
};

// ============================================================================
// FIELD EDITORS
// ============================================================================

interface EditorProps {
  data: any;
  onChange: (data: any) => void;
}

interface FieldEditorProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

const PersonalInfoEditor: React.FC<FieldEditorProps> = ({ data, onChange }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
      <input
        type="text"
        value={data?.name || ''}
        onChange={(e) => onChange('name', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
      <input
        type="text"
        value={data?.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        type="email"
        value={data?.email || ''}
        onChange={(e) => onChange('email', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
      <input
        type="tel"
        value={data?.phone || ''}
        onChange={(e) => onChange('phone', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <input
        type="text"
        value={data?.location || ''}
        onChange={(e) => onChange('location', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

const SummaryEditor: React.FC<EditorProps> = ({ data, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
    <textarea
      value={data || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={6}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Write a compelling professional summary..."
    />
  </div>
);

const SkillsEditor: React.FC<EditorProps> = ({ data, onChange }) => {
  const skills = Array.isArray(data) ? data : [];
  
  const addSkill = () => {
    onChange([...skills, '']);
  };
  
  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    onChange(newSkills);
  };
  
  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange(newSkills);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
      <div className="space-y-2">
        {skills.map((skill: string, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter skill"
            />
            <button
              onClick={() => removeSkill(index)}
              className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addSkill}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          <PlusIcon className="w-4 h-4" />
          Add Skill
        </button>
      </div>
    </div>
  );
};

const WorkExperienceEditor: React.FC<EditorProps> = ({ data, onChange }) => {
  const experiences = Array.isArray(data) ? data : [];
  
  // Simplified work experience editor - would be more complex in real implementation
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience</label>
      <p className="text-sm text-gray-500 mb-3">
        Complex work experience editing would be implemented here with add/remove/edit capabilities.
      </p>
      <div className="text-sm text-gray-700">
        Current entries: {experiences.length}
      </div>
    </div>
  );
};

const EducationEditor: React.FC<EditorProps> = ({ data, onChange }) => {
  const education = Array.isArray(data) ? data : [];
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
      <p className="text-sm text-gray-500 mb-3">
        Education editing interface would be implemented here.
      </p>
      <div className="text-sm text-gray-700">
        Current entries: {education.length}
      </div>
    </div>
  );
};

const ProjectsEditor: React.FC<EditorProps> = ({ data, onChange }) => {
  const projects = Array.isArray(data) ? data : [];
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Projects</label>
      <p className="text-sm text-gray-500 mb-3">
        Projects editing interface would be implemented here.
      </p>
      <div className="text-sm text-gray-700">
        Current entries: {projects.length}
      </div>
    </div>
  );
};

const GenericEditor: React.FC<EditorProps> = ({ data, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Raw Data</label>
    <textarea
      value={typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      onChange={(e) => {
        try {
          const parsed = JSON.parse(e.target.value);
          onChange(parsed);
        } catch {
          // If not valid JSON, treat as string
          onChange(e.target.value);
        }
      }}
      rows={10}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
    />
  </div>
);

// ============================================================================
// ICONS
// ============================================================================

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);