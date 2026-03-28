
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Draft } from '@/types/draft';
import DraftCard from './DraftCard';
import { useNavigate } from 'react-router-dom';

interface DraftsListProps {
  drafts: Draft[];
  onView: (draft: Draft) => void;
  onEdit: (draft: Draft) => void;
  onDelete: (draft: Draft) => void;
  onDuplicate: (draft: Draft) => void;
  currentUserId: string;
  userRole: string;
}

const DraftsList = ({
  drafts,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  currentUserId,
  userRole
}: DraftsListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         draft.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || draft.screening_type === filterType;
    const matchesUser = filterUser === 'all' || 
                       (filterUser === 'mine' && draft.user_id === currentUserId);
    
    return matchesSearch && matchesType && matchesUser;
  });

  const canEdit = (draft: Draft) => {
    return draft.user_id === currentUserId || userRole === 'admin';
  };

  const canDelete = (draft: Draft) => {
    return draft.user_id === currentUserId || userRole === 'admin';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search drafts by title or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="speech">Speech</SelectItem>
              <SelectItem value="hearing">Hearing</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="mine">My Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create New Draft Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={() => navigate('/screening/speech')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Speech Screening
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/screening/hearing')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Hearing Screening
        </Button>
      </div>

      {/* Drafts Grid */}
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No drafts found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterType !== 'all' || filterUser !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first screening draft to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              canEdit={canEdit(draft)}
              canDelete={canDelete(draft)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsList;
