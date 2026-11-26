import { supabase } from '@/lib/supabase'
import { dateUtils } from '@/utils/dateUtils'
import {
  emptyCommunicationModes,
  type CommunicationModes,
  type CompassActionItem,
  type CompassActionItemUpdate,
  type CompassGoal,
  type CompassGoalUpdate,
  type CompassProfile,
  type CompassProfileCreateInput,
  type CompassProfileSummary,
  type CompassProfileUpdate,
  type CompassProfileWithItems,
} from '@/types/compass'
