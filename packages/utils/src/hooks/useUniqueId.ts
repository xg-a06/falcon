import { useMemo } from 'react';
import { v4 } from 'uuid';

const useUniqueId = () => useMemo(() => v4(), []);

export default useUniqueId;
