
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-2 font-medium">{title}</h1>
          {description && (
            <p className="text-gray-600 text-base">{description}</p>
          )}
        </div>
        {actions && (
          <div className="mt-4 sm:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
