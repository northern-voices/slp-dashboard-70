import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Search, Edit, UserX, Users, X, Mail } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrgUser } from '@/types/database'
import { useOrganization } from '@/contexts/OrganizationContext'

interface UsersTableProps {
  users: OrgUser[]
  onEditUser: (user: OrgUser) => void
  onDeactivateUser: (userId: string) => void
  onResendInvite: (userId: string) => void
  onAssignSchool?: (userId: string, schoolId: string) => void
  onUnassignSchool?: (userId: string, schoolId: string) => void
  canManageAssignments?: boolean
  selectedUsers?: string[]
  onSelectionChange?: (selectedUsers: string[]) => void
}

const UsersTable = ({
  users,
  onEditUser,
  onDeactivateUser,
  onResendInvite,
  onAssignSchool,
  onUnassignSchool,
  canManageAssignments = false,
  selectedUsers = [],
  onSelectionChange,
}: UsersTableProps) => {
  const { availableSchools } = useOrganization()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange(filteredUsers.map(user => user.id))
      } else {
        onSelectionChange([])
      }
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedUsers, userId])
      } else {
        onSelectionChange(selectedUsers.filter(id => id !== userId))
      }
    }
  }

  const isAllSelected =
    filteredUsers.length > 0 && filteredUsers.every(user => selectedUsers.includes(user.id))
  const isIndeterminate = selectedUsers.length > 0 && !isAllSelected

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className='font-medium text-purple-700 border-purple-200 bg-purple-50'>
            Administrator
          </Badge>
        )
      case 'supervisor':
        return (
          <Badge className='font-medium text-blue-700 border-blue-200 bg-blue-50'>Supervisor</Badge>
        )
      case 'slp':
        return (
          <Badge className='font-medium bg-emerald-50 text-emerald-700 border-emerald-200'>
            SLP
          </Badge>
        )
      case 'super_admin':
        return (
          <Badge className='font-medium bg-rose-50 text-rose-700 border-rose-200'>Root Admin</Badge>
        )
      case 'hearing_technician':
        return (
          <Badge className='font-medium bg-sky-50 text-sky-700 border-sky-200 whitespace-nowrap'>
            Hearing Technician
          </Badge>
        )
      default:
        return <Badge variant='secondary'>{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className='font-medium bg-emerald-50 text-emerald-700 border-emerald-200'>
            Active
          </Badge>
        )
      case 'unverified':
        return (
          <Badge className='font-medium bg-amber-50 text-amber-700 border-amber-200'>
            Unverified
          </Badge>
        )
      case 'invited':
        return (
          <Badge className='font-medium bg-blue-50 text-blue-700 border-blue-200'>Invited</Badge>
        )
      case 'expired':
        return (
          <Badge variant='outline' className='text-red-600 border-red-300'>
            Expired
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant='outline' className='text-gray-600 border-gray-300'>
            Inactive
          </Badge>
        )
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex flex-col gap-4 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2' />
          <Input
            placeholder='Search users by name or email...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200'
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className='w-full border-gray-200 sm:w-40'>
            <SelectValue placeholder='All Roles' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            <SelectItem value='super_admin'>Root Admin</SelectItem>
            <SelectItem value='admin'>Administrator</SelectItem>
            <SelectItem value='slp'>SLP</SelectItem>
            <SelectItem value='hearing_technician'>Hearing Technician</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full border-gray-200 sm:w-40'>
            <SelectValue placeholder='All Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='unverified'>Unverified</SelectItem>
            <SelectItem value='invited'>Invited</SelectItem>
            <SelectItem value='expired'>Expired</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className='bg-white border-gray-200 shadow-sm'>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  {onSelectionChange && (
                    <TableHead className='w-12'>
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label='Select all users'
                        {...(isIndeterminate ? { 'data-state': 'indeterminate' } : {})}
                      />
                    </TableHead>
                  )}
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schools</TableHead>
                  <TableHead className='w-16'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => {
                  const isPendingInvite = user.status === 'invited' || user.status === 'expired'
                  const hasName = Boolean(user.first_name || user.last_name)

                  return (
                    <TableRow key={user.id} className='group'>
                      {onSelectionChange && (
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={checked => handleSelectUser(user.id, !!checked)}
                            aria-label={`Select ${hasName ? `${user.first_name} ${user.last_name}` : user.email}`}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='text-sm font-medium text-gray-900'>
                            {hasName ? `${user.first_name} ${user.last_name}` : user.email}
                          </div>
                          {hasName && <div className='text-sm text-gray-500'>{user.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>

                      <TableCell>{getStatusBadge(user.status)}</TableCell>

                      <TableCell>
                        <div className='flex flex-wrap items-center gap-1'>
                          {user.schools && user.schools.length > 0 ? (
                            user.schools.map(school => (
                              <span
                                key={school.id}
                                className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100'>
                                {school.name}
                                {canManageAssignments && !isPendingInvite && (
                                  <button
                                    type='button'
                                    onClick={() => onUnassignSchool?.(user.id, school.id)}
                                    className='hover:text-blue-900'
                                    aria-label={`Remove ${school.name}`}>
                                    <X className='w-3 h-3' />
                                  </button>
                                )}
                              </span>
                            ))
                          ) : (
                            <span className='text-sm italic text-gray-400'>No assignments</span>
                          )}

                          {canManageAssignments &&
                            !isPendingInvite &&
                            (() => {
                              const unassigned = availableSchools.filter(
                                school => !user.schools?.some(s => s.id === school.id)
                              )
                              if (unassigned.length === 0) return null
                              return (
                                <Select
                                  key={user.schools?.length ?? 0}
                                  onValueChange={schoolId => onAssignSchool?.(user.id, schoolId)}>
                                  <SelectTrigger className='w-32 h-7 text-xs border-dashed'>
                                    <SelectValue placeholder='+ Add school' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {unassigned.map(school => (
                                      <SelectItem key={school.id} value={school.id}>
                                        {school.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )
                            })()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-8 h-8 p-0 transition-opacity opacity-0 group-hover:opacity-100'>
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-40'>
                            {isPendingInvite ? (
                              <DropdownMenuItem
                                onClick={() => onResendInvite(user.id)}
                                className='text-sm'>
                                <Mail className='w-4 h-4 mr-2' />
                                Resend Invite
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onEditUser(user)}
                                  className='text-sm'>
                                  <Edit className='w-4 h-4 mr-2' />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onDeactivateUser(user.id)}
                                  className='text-sm text-red-600'>
                                  <UserX className='w-4 h-4 mr-2' />
                                  {user.is_active ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className='py-12 text-center text-gray-500'>
              <Users className='w-12 h-12 mx-auto mb-4 text-gray-300' />
              <p className='font-medium text-gray-500'>No users found</p>
              <p className='mt-1 text-sm text-gray-400'>
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UsersTable
