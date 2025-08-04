import React from 'react'
import { Check, ChevronsUpDown, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

const SchoolSelector = () => {
  const [open, setOpen] = React.useState(false)
  const { currentSchool, availableSchools, setCurrentSchool, isLoading } = useOrganization()

  if (isLoading) {
    return (
      <div className='px-2 py-1'>
        <div className='flex items-center space-x-2 p-2 rounded-md bg-gray-100 animate-pulse'>
          <Building2 className='w-4 h-4' />
          <div className='h-4 bg-gray-200 rounded flex-1'></div>
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between text-left font-normal'>
          <div className='flex items-center space-x-2 min-w-0'>
            <div className='w-4 h-4 rounded flex items-center justify-center overflow-hidden flex-shrink-0'>
              <img
                src='/lovable-uploads/bc930c0b-cb09-4e70-9ac0-a44c74d79d80.png'
                alt='School Logo'
                className='w-full h-full object-contain'
              />
            </div>
            <span className='truncate'>
              {currentSchool ? currentSchool.name : 'Select school...'}
            </span>
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
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
                      setCurrentSchool(school.id === currentSchool?.id ? null : school)
                      setOpen(false)
                    }}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currentSchool?.id === school.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex items-center space-x-2'>
                      <div className='w-4 h-4 rounded flex items-center justify-center overflow-hidden flex-shrink-0'>
                        <img
                          src='/lovable-uploads/bc930c0b-cb09-4e70-9ac0-a44c74d79d80.png'
                          alt='School Logo'
                          className='w-full h-full object-contain'
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
