import type { GymMember } from '../types/pos.types';

export const MOCK_MEMBERS: GymMember[] = [
  {
    id: 'mem_1042',
    memberNumber: 'PF-1042',
    fullName: 'Carlos Mendoza Ramos',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    balance: 84.50,
    tier: 'VIP Athlete',
    lockerNumber: 'Casillero #42',
    lastVisit: 'Hoy, 07:15 AM (Sala Pesas)',
  },
  {
    id: 'mem_2089',
    memberNumber: 'PF-2089',
    fullName: 'Valeria Sotomayor',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    balance: 142.00,
    tier: 'Elite Member',
    lockerNumber: 'Casillero #118',
    lastVisit: 'Hoy, 08:30 AM (Spinning Pro)',
  },
  {
    id: 'mem_3155',
    memberNumber: 'PF-3155',
    fullName: 'Diego Alejandro Silva',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    balance: 18.25,
    tier: 'CrossFit Pro',
    lockerNumber: 'Casillero #05',
    lastVisit: 'Hoy, 09:10 AM (CrossFit Box)',
  },
  {
    id: 'mem_4510',
    memberNumber: 'PF-4510',
    fullName: 'Mariana Ríos Castillejo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    balance: 55.00,
    tier: 'VIP Athlete',
    lockerNumber: 'Casillero #76',
    lastVisit: 'Hoy, 09:45 AM (Pilates Reformer)',
  },
  {
    id: 'mem_5601',
    memberNumber: 'PF-5601',
    fullName: 'Rodrigo Gómez Beltrán',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    balance: 8.50, // low balance test
    tier: 'Basic Pass',
    lockerNumber: 'Casillero #201',
    lastVisit: 'Ayer, 06:00 PM (Área Cardio)',
  },
];
