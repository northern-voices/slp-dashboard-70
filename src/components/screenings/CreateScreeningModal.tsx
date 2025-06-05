
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Mic, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateScreeningModal = ({ isOpen, onClose }: CreateScreeningModalProps) => {
  const navigate = useNavigate();
  
  const handleCreateScreening = (type: 'speech' | 'hearing', mode: 'individual' | 'classwide') => {
    onClose();
    if (mode === 'individual') {
      navigate(`/screening/${type}`);
    } else {
      // Navigate to class-wide screening creation
      navigate(`/screening/${type}?mode=classwide`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Screening</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Screening</TabsTrigger>
            <TabsTrigger value="classwide">Class-Wide Screening</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateScreening('speech', 'individual')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Speech Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 mb-4">
                    Conduct individual speech and language screening for articulation, language, voice, and fluency assessment.
                  </p>
                  <Button className="w-full" onClick={() => handleCreateScreening('speech', 'individual')}>
                    <User className="w-4 h-4 mr-2" />
                    Create Individual Speech Screening
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateScreening('hearing', 'individual')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle>Hearing Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 mb-4">
                    Perform individual hearing screening including pure tone testing and tympanometry assessment.
                  </p>
                  <Button className="w-full" onClick={() => handleCreateScreening('hearing', 'individual')}>
                    <User className="w-4 h-4 mr-2" />
                    Create Individual Hearing Screening
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="classwide" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateScreening('speech', 'classwide')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Mic className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Class-Wide Speech Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 mb-4">
                    Schedule and manage speech screenings for entire classrooms or grade levels simultaneously.
                  </p>
                  <Button className="w-full" onClick={() => handleCreateScreening('speech', 'classwide')}>
                    <Users className="w-4 h-4 mr-2" />
                    Create Class-Wide Speech Screening
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCreateScreening('hearing', 'classwide')}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-teal-600" />
                  </div>
                  <CardTitle>Class-Wide Hearing Screening</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 mb-4">
                    Organize hearing screenings for multiple students across classrooms and generate batch reports.
                  </p>
                  <Button className="w-full" onClick={() => handleCreateScreening('hearing', 'classwide')}>
                    <Users className="w-4 h-4 mr-2" />
                    Create Class-Wide Hearing Screening
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScreeningModal;
