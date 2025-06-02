
import React from 'react';
import { Filter } from 'lucide-react';

const DataFilteringHeader = () => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
        <Filter className="w-5 h-5" />
        <span>Data Scope & Filters</span>
      </h3>
      <p className="text-gray-600 mb-6">
        Select which data to include in your scheduled reports. Leave selections empty to include all available data.
      </p>
    </div>
  );
};

export default DataFilteringHeader;
