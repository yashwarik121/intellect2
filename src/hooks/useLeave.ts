import { useState } from 'react';
import { leaveService } from '../services/leaveService';
import { LeaveRequestPayload } from '../models/leaveModel';

export function useLeave() {
  const [loading, setLoading] = useState<boolean>(false);

  const applyLeave = async (payload: LeaveRequestPayload) => {
    setLoading(true);
    try {
      return await leaveService.applyLeave(payload);
    } finally {
      setLoading(false);
    }
  };

  return { applyLeave, loading };
}
