import React from 'react'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useNavigate, useLocation } from 'react-router-dom'
import { School } from '@/types/database'

const SchoolSelector = () => {
  const [open, setOpen] = React.useState(false)
  const { availableSchools, isLoading } = useOrganization()
  const { currentSchool } = useCurrentSchool()
  const navigate = useNavigate()
  const location = useLocation()

  const navigateToSchool = (school: School) => {
    const currentPath = location.pathname

    setOpen(false)

    let newPath: string

    if (currentPath.startsWith('/school/')) {
      newPath = currentPath.replace(/^\/school\/[^/]+/, `/school/${school.id}`)

      if (newPath.includes('/speech-screening-reports')) {
        newPath = `/school/${school.id}/speech-screening-reports`
      }
    } else {
      newPath = `/school/${school.id}`
    }

    navigate(newPath, { replace: true })
  }

  if (isLoading) {
    return (
      <Button variant='outline' disabled className='justify-between w-full font-normal text-left'>
        <div className='flex items-center min-w-0 space-x-2'>
          <Skeleton className='flex-shrink-0 w-4 h-4 rounded' />
          <Skeleton className='w-32 h-4' />
        </div>
        <ChevronsUpDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='justify-between w-full font-normal text-left'>
          <div className='flex items-center min-w-0 space-x-2'>
            <div className='flex items-center justify-center flex-shrink-0 w-4 h-4 overflow-hidden rounded'>
              <img
                src='/lovable-uploads/bc930c0b-cb09-4e70-9ac0-a44c74d79d80.png'
                alt='School Logo'
                className='object-contain w-full h-full'
              />
            </div>
            <span className='truncate'>
              {currentSchool ? currentSchool.name : 'Select school...'}
            </span>
          </div>
          <ChevronsUpDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command>
          <CommandInput placeholder='Search schools...' />
          <CommandList>
            <CommandEmpty>No schools found.</CommandEmpty>
            <CommandGroup>
              {availableSchools.map(school => {
                return (
                  <CommandItem
                    key={school.id}
                    value={school.name}
                    onSelect={() => {
                      // console.log('SchoolSelector - onSelect triggered for school:', school.name)
                      // console.log('Current school before change:', currentSchool?.name)
                      navigateToSchool(school)
                    }}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentSchool?.id === school.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex items-center space-x-2'>
                      <div className='flex items-center justify-center flex-shrink-0 w-4 h-4 overflow-hidden rounded'>
                        <img
                          src='/lovable-uploads/bc930c0b-cb09-4e70-9ac0-a44c74d79d80.png'
                          alt='School Logo'
                          className='object-contain w-full h-full'
                        />
                      </div>
                      <div className='flex flex-col'>
                        <span>{school.name}</span>
                        {school.city && (
                          <span className='text-xs text-gray-500'>{school.city}</span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default SchoolSelector
