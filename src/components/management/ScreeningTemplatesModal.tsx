
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Search, Edit, Eye, Copy } from 'lucide-react';
import TemplateEditor from './TemplateEditor';

interface ScreeningTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScreeningTemplatesModal = ({ isOpen, onClose }: ScreeningTemplatesModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [templates] = useState([
    {
      id: 1,
      name: "Speech Articulation Assessment",
      category: "Speech",
      description: "Comprehensive speech sound assessment for K-5 students",
      lastModified: "2024-11-20",
      usage: 45,
      status: "active"
    },
    {
      id: 2,
      name: "Hearing Screening Basic",
      category: "Hearing",
      description: "Standard hearing screening protocol",
      lastModified: "2024-11-18",
      usage: 32,
      status: "active"
    },
    {
      id: 3,
      name: "Language Development Progress",
      category: "Progress",
      description: "Tracking language development milestones",
      lastModified: "2024-11-15",
      usage: 28,
      status: "draft"
    }
  ]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isEditing) {
    return (
      <TemplateEditor
        isOpen={isOpen}
        onClose={() => {
          setIsEditing(false);
          setSelectedTemplate(null);
          onClose();
        }}
        template={selectedTemplate}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Screening Templates
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Manage and customize screening templates for your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto p-1">
            <TabsTrigger value="library" className="flex-shrink-0">Template Library</TabsTrigger>
            <TabsTrigger value="categories" className="flex-shrink-0">Categories</TabsTrigger>
            <TabsTrigger value="settings" className="flex-shrink-0">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {getStatusBadge(template.status)}
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><strong>Category:</strong> {template.category}</p>
                      <p className="text-sm"><strong>Last Modified:</strong> {template.lastModified}</p>
                      <p className="text-sm"><strong>Usage:</strong> {template.usage} times</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-1" />
                        Clone
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Speech', 'Hearing', 'Progress', 'Custom'].map((category) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{category} Templates</CardTitle>
                    <CardDescription>
                      Templates for {category.toLowerCase()} assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {templates.filter(t => t.category === category).length} templates available
                    </p>
                    <Button variant="outline" className="w-full">
                      Manage {category} Templates
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Settings</CardTitle>
                <CardDescription>
                  Configure global template preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Default Template Options</h4>
                    <p className="text-sm text-gray-600">Configure default settings for new templates</p>
                  </div>
                  <Button variant="outline">Configure Defaults</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ScreeningTemplatesModal;
