
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

interface HearingScreeningFieldsProps {
  form: UseFormReturn<any>;
}

const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];

const HearingScreeningFields = ({ form }: HearingScreeningFieldsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pure Tone Screening Results</CardTitle>
          <p className="text-sm text-gray-600">Record hearing threshold levels in dB HL</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Right Ear */}
            <div>
              <h4 className="font-medium mb-3">Right Ear</h4>
              <div className="space-y-3">
                {frequencies.map(freq => (
                  <div key={`right-${freq}`} className="flex items-center gap-3">
                    <Label className="w-16">{freq} Hz</Label>
                    <Input
                      type="number"
                      placeholder="dB HL"
                      className="w-24"
                      min="0"
                      max="120"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Left Ear */}
            <div>
              <h4 className="font-medium mb-3">Left Ear</h4>
              <div className="space-y-3">
                {frequencies.map(freq => (
                  <div key={`left-${freq}`} className="flex items-center gap-3">
                    <Label className="w-16">{freq} Hz</Label>
                    <Input
                      type="number"
                      placeholder="dB HL"
                      className="w-24"
                      min="0"
                      max="120"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tympanometry Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Right Ear Tympanogram</Label>
              <select className="w-full p-2 border rounded-md mt-1">
                <option value="">Select type</option>
                <option value="Type A">Type A (Normal)</option>
                <option value="Type As">Type As (Shallow)</option>
                <option value="Type Ad">Type Ad (Deep)</option>
                <option value="Type B">Type B (Flat)</option>
                <option value="Type C">Type C (Negative pressure)</option>
              </select>
            </div>
            <div>
              <Label>Left Ear Tympanogram</Label>
              <select className="w-full p-2 border rounded-md mt-1">
                <option value="">Select type</option>
                <option value="Type A">Type A (Normal)</option>
                <option value="Type As">Type As (Shallow)</option>
                <option value="Type Ad">Type Ad (Deep)</option>
                <option value="Type B">Type B (Flat)</option>
                <option value="Type C">Type C (Negative pressure)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <Label>Additional Tympanometry Notes</Label>
            <Textarea
              placeholder="Note any additional findings, ear canal volume, acoustic reflex results..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Otoscopic Examination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Right Ear Canal/Eardrum</Label>
                <Textarea
                  placeholder="Describe appearance: normal, wax, inflammation, perforation..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Left Ear Canal/Eardrum</Label>
                <Textarea
                  placeholder="Describe appearance: normal, wax, inflammation, perforation..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Behavioral Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Note student's responses to sounds, following directions, attention during testing, any concerns raised by teacher/parent..."
            rows={4}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HearingScreeningFields;
