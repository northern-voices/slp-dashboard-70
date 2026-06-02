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
import { MoreHorizontal, Search, Edit, UserX, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrgUser } from '@/types/database'

interface UsersTableProps {
  users: OrgUser[]
  onEditUser: (user: OrgUser) => void
  onDeactivateUser: (userId: string) => void
  onResendInvite: (userId: string) => void
  selectedUsers?: string[]
  onSelectionChange?: (selectedUsers: string[]) => void
}

const UsersTable = ({
  users,
  onEditUser,
  onDeactivateUser,
  onResendInvite,
  selectedUsers = [],
  onSelectionChange,
}: UsersTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'active' ? user.is_active : !user.is_active)

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
      case 'inactive':
        return (
          <Badge variant='outline' className='text-gray-600 border-gray-300'>
            Inactive
          </Badge>
        )
      case 'pending':
        return (
          <Badge className='font-medium bg-amber-50 text-amber-700 border-amber-200'>Pending</Badge>
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
            <SelectItem value='admin'>Administrator</SelectItem>
            <SelectItem value='supervisor'>Supervisor</SelectItem>
            <SelectItem value='slp'>SLP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full border-gray-200 sm:w-40'>
            <SelectValue placeholder='All Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
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
                {filteredUsers.map(user => (
                  <TableRow key={user.id} className='group'>
                    {onSelectionChange && (
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={checked => handleSelectUser(user.id, !!checked)}
                          aria-label={`Select ${user.first_name} ${user.last_name}`}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className='space-y-1'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.first_name} {user.last_name}
                        </div>
                        <div className='text-sm text-gray-500'>{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.is_active ? 'active' : 'inactive')}</TableCell>
                    <TableCell>
                      <div className='text-sm text-gray-600'>
                        {user.schools && user.schools.length > 0 ? (
                          <div className='flex items-center gap-1'>
                            <Users className='w-3 h-3 text-gray-400' />
                            <span>{user.schools.map(s => s.name).join(', ')}</span>
                          </div>
                        ) : (
                          <span className='italic text-gray-400'>No assignments</span>
                        )}
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
                          <DropdownMenuItem onClick={() => onEditUser(user)} className='text-sm'>
                            <Edit className='w-4 h-4 mr-2' />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeactivateUser(user.id)}
                            className='text-sm text-red-600'>
                            <UserX className='w-4 h-4 mr-2' />
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
