import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import UsersTable from './UsersTable'
import { OrgUser } from '@/types/database'

interface UsersTabContentProps {
  users: OrgUser[]
  onInviteUser: () => void
  onEditUser: (user: OrgUser) => void
  onDeactivateUser: (userId: string) => void
  onResendInvite: (userId: string) => void
}

const UsersTabContent = ({
  users,
  onInviteUser,
  onEditUser,
  onDeactivateUser,
  onResendInvite,
}: UsersTabContentProps) => {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <h2 className='text-xl font-semibold'>User Management</h2>
        <Button onClick={onInviteUser}>
          <UserPlus className='w-4 h-4 mr-2' />
          Invite User
        </Button>
      </div>

      <UsersTable
        users={users}
        onEditUser={onEditUser}
        onDeactivateUser={onDeactivateUser}
        onResendInvite={onResendInvite}
      />
    </div>
  )
}

export default UsersTabContent
