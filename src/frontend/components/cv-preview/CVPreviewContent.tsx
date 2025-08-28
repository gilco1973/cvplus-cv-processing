/**
 * CVPlus CV Processing - CV Preview Content Component
 * 
 * Main content area for displaying CV preview with zoom and scroll support.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useRef, useEffect } from 'react';
import { cn } from '@cvplus/core/utils';
import type { CVParsedData } from '../../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface CVPreviewContentProps {
  cvData: CVParsedData;
  zoom: number;
  isEditMode: boolean;
  onSectionClick?: (section: string) => void;
  onFieldEdit?: (field: string, value: any) => void;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CVPreviewContent: React.FC<CVPreviewContentProps> = ({
  cvData,
  zoom,
  isEditMode,
  onSectionClick,
  onFieldEdit,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to top when CV data changes
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [cvData]);

  const handleSectionClick = (section: string) => {
    if (isEditMode && onSectionClick) {
      onSectionClick(section);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex-1 overflow-auto bg-gray-100 p-4',
        className
      )}
    >
      <div
        className="mx-auto bg-white shadow-lg"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width: '210mm', // A4 width
          minHeight: '297mm', // A4 height
          marginBottom: `${(1 - zoom) * 100}vh`, // Adjust bottom margin based on zoom
        }}
      >
        {/* CV Content */}
        <div className="p-8">
          {/* Personal Information */}
          <section
            className={cn(
              'mb-6 pb-4 border-b border-gray-200',
              isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
            )}
            onClick={() => handleSectionClick('personalInfo')}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cvData.personalInfo?.name || 'Full Name'}
            </h1>
            <div className="text-lg text-gray-600 mb-3">
              {cvData.personalInfo?.title || 'Professional Title'}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {cvData.personalInfo?.email && (
                <div className="flex items-center gap-1">
                  <EmailIcon className="w-4 h-4" />
                  {cvData.personalInfo.email}
                </div>
              )}
              {cvData.personalInfo?.phone && (
                <div className="flex items-center gap-1">
                  <PhoneIcon className="w-4 h-4" />
                  {cvData.personalInfo.phone}
                </div>
              )}
              {cvData.personalInfo?.location && (
                <div className="flex items-center gap-1">
                  <LocationIcon className="w-4 h-4" />
                  {cvData.personalInfo.location}
                </div>
              )}
            </div>
          </section>

          {/* Professional Summary */}
          {cvData.summary && (
            <section
              className={cn(
                'mb-6',
                isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
              )}
              onClick={() => handleSectionClick('summary')}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {cvData.summary}
              </p>
            </section>
          )}

          {/* Skills */}
          {cvData.skills && cvData.skills.length > 0 && (
            <section
              className={cn(
                'mb-6',
                isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
              )}
              onClick={() => handleSectionClick('skills')}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Work Experience */}
          {cvData.workExperience && cvData.workExperience.length > 0 && (
            <section
              className={cn(
                'mb-6',
                isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
              )}
              onClick={() => handleSectionClick('workExperience')}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Work Experience
              </h2>
              {cvData.workExperience.map((job, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {job.position || 'Position'}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {job.company || 'Company Name'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.startDate} - {job.endDate || 'Present'}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-gray-700 mb-2">{job.description}</p>
                  )}
                  {job.achievements && job.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {job.achievements.map((achievement, achIndex) => (
                        <li key={achIndex}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {cvData.education && cvData.education.length > 0 && (
            <section
              className={cn(
                'mb-6',
                isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
              )}
              onClick={() => handleSectionClick('education')}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Education
              </h2>
              {cvData.education.map((edu, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {edu.degree || 'Degree'}
                      </h3>
                      <p className="text-blue-600">{edu.institution || 'Institution'}</p>
                      {edu.gpa && (
                        <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {edu.graduationDate || 'Year'}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {cvData.projects && cvData.projects.length > 0 && (
            <section
              className={cn(
                'mb-6',
                isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
              )}
              onClick={() => handleSectionClick('projects')}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Projects
              </h2>
              {cvData.projects.map((project, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project.name || 'Project Name'}
                    </h3>
                    {project.date && (
                      <div className="text-sm text-gray-500">{project.date}</div>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 mb-2">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {cvData.certifications && cvData.certifications.length > 0 && (
            <section
              className={cn(
                'mb-6',
                isEditMode && 'cursor-pointer hover:bg-gray-50 rounded p-2'
              )}
              onClick={() => handleSectionClick('certifications')}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Certifications
              </h2>
              {cvData.certifications.map((cert, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">
                      {cert.name || 'Certification Name'}
                    </h3>
                    {cert.date && (
                      <div className="text-sm text-gray-500">{cert.date}</div>
                    )}
                  </div>
                  {cert.issuer && (
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ICONS
// ============================================================================

const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);