import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CollapsibleNotesCardProps {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

const CollapsibleNotesCard = ({ title, open, onToggle, children }: CollapsibleNotesCardProps) => {
  return (
    <Card>
      <CardHeader className='cursor-pointer select-none' onClick={onToggle}>
        <CardTitle className='flex items-center justify-between'>
          {title}
          <span className='text-lg font-normal text-muted-foreground'>
            {open ? '▲ Hide' : '▼ Show'}
          </span>
        </CardTitle>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  )
}

export default CollapsibleNotesCard
