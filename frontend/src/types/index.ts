// User role type
export type UserRole = 'admin' | 'user' | 'developer';

// Client status type
export type ClientStatus = 'new' | 'thinking' | 'agreed' | 'rejected' | 'callback';

// Project status type (Loyiha)
export type ProjectStatus = 'in_progress' | 'completed';

// Conversation type
export type ConversationType = 'text' | 'audio' | 'image' | 'video';

// User type
export interface User {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: UserRole;
}

// Location type
export interface Location {
  address?: string;
  latitude: number;
  longitude: number;
}

// Client type
export interface Client {
  _id: string;
  userId: string;
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: Location;
  notes?: string;
  status: ClientStatus;
  followUpDate?: string;
  lastConversationSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Milestone (Bosqich) type
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'paid';

export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  percentage: number;
  dueDate?: string;
  status: MilestoneStatus;
  completedAt?: string;
  paidAt?: string;
  tasks?: string[];
}

// Team member type
export interface TeamMember {
  developerId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber?: string;
  };
  role: 'developer' | 'team_lead';
  joinedAt: string;
}

// Project type (Loyiha)
export interface Project {
  _id: string;
  userId: string;
  clientId: string | Client;
  title: string;
  description?: string;
  amount?: number;
  status: ProjectStatus;
  progress?: number;
  milestones?: Milestone[];
  totalPaid?: number;
  team?: TeamMember[];
  teamLeadId?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Order type - alias for backward compatibility
export type Order = Project;
export type OrderStatus = ProjectStatus;

// Conversation type
export interface Conversation {
  _id: string;
  clientId: string;
  userId: string;
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'developer'; // Seller yoki Dasturchi
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  userId?: string;
  role?: UserRole;
  message?: string;
}

// Client form data
export interface ClientFormData {
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: Location;
  notes?: string;
  status?: ClientStatus;
  followUpDate?: string;
}

// Project form data (Loyiha)
export interface ProjectFormData {
  clientId: string;
  title: string;
  description?: string;
  amount?: number;
  status?: ProjectStatus;
}

// Order form data - alias for backward compatibility
export type OrderFormData = ProjectFormData;

// Conversation form data
export interface ConversationFormData {
  clientId: string;
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Status badge colors
export const STATUS_COLORS: Record<ClientStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  thinking: 'bg-yellow-100 text-yellow-800',
  agreed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  callback: 'bg-purple-100 text-purple-800',
};

// Status labels (Uzbek)
export const STATUS_LABELS: Record<ClientStatus, string> = {
  new: 'Yangi',
  thinking: "O'ylab ko'raman",
  agreed: 'Roziman',
  rejected: 'Rad etdi',
  callback: 'Keyinroq bog\'lanish',
};

// Project status colors (Loyiha)
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

// Project status labels (Uzbek)
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  in_progress: 'Jarayonda',
  completed: 'Tugallangan',
};

// Aliases for backward compatibility
export const ORDER_STATUS_COLORS = PROJECT_STATUS_COLORS;
export const ORDER_STATUS_LABELS = PROJECT_STATUS_LABELS;

// Milestone status colors
export const MILESTONE_STATUS_COLORS: Record<MilestoneStatus, string> = {
  pending: 'bg-gray-500/20 text-gray-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  paid: 'bg-purple-500/20 text-purple-400',
};

// Milestone status labels (Uzbek)
export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  pending: 'Kutilmoqda',
  in_progress: 'Jarayonda',
  completed: 'Bajarildi',
  paid: 'To\'landi',
};

// Conversation type labels
export const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  text: 'Matn',
  audio: 'Audio',
  image: 'Rasm',
  video: 'Video',
};

// Employee type (Xodim)
export interface Employee {
  _id: string;
  userId: string;
  fullName: string;
  position: string;
  phoneNumber?: string;
  email?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Employee form data
export interface EmployeeFormData {
  fullName: string;
  position: string;
  phoneNumber?: string;
  email?: string;
}
