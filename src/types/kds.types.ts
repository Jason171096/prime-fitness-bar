import type { Order } from './pos.types';

export type KDSColumnStatus = 'pending' | 'blending' | 'ready';

export interface KDSOrder extends Order {
  elapsedSeconds: number;
  blenderStation?: string; // e.g. "Vitamix Pro #1" | "Barra Fría #2"
  priorityAlert?: 'normal' | 'warning' | 'urgent';
}
