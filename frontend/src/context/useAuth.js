import { useContext } from 'react';
import { AuthContext } from './auth-context';
 
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth ต้องถูกเรียกใช้ภายใน AuthProvider เท่านั้น');
  return context;
}
 