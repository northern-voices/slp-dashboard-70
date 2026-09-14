import { useNavigate } from 'react-router-dom'
import { User, Mic, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CreateScreeningModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateScreeningModal = ({ isOpen, onClose }: CreateScreeningModalProps) => {
  const navigate = useNavigate()

  const handleCreateScreening = (screeningType?: 'rescreening') => {
    onClose()
    navigate(screeningType === 'rescreening' ? '/screening/rescreening' : '/screening/speech')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Create New Screening</DialogTitle>
        </DialogHeader>

        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => handleCreateScreening()}>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Mic className='w-6 h-6 text-purple-600' />
              </div>
              <CardTitle>Speech Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-center text-gray-600 mb-4'>
                Conduct individual speech and language screening for articulation, language, voice,
                and fluency assessment.
              </p>
              <Button className='w-full' onClick={() => handleCreateScreening()}>
                <User className='w-4 h-4 mr-2' />
                Create Speech Screening
              </Button>
            </CardContent>
          </Card>

          <Card
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => handleCreateScreening('rescreening')}>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center'>
                <RefreshCw className='w-6 h-6 text-teal-600' />
              </div>
              <CardTitle>Rescreening</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-center text-gray-600 mb-4'>
                Conduct a follow-up rescreening for students who require additional speech and
                language evaluation.
              </p>
              <Button className='w-full' onClick={() => handleCreateScreening('rescreening')}>
                <User className='w-4 h-4 mr-2' />
                Create Rescreening
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateScreeningModal
