import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDraftOptions<T> {
  key: string
  initialData: T
  debounceMs?: number
}
