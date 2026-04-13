import { v4 as uuidv4 } from 'uuid';

/** Generate a unique entity ID */
export function createId(): string {
  return uuidv4();
}
