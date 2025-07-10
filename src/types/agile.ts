// Agile Project Management Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'product_owner' | 'scrum_master' | 'developer' | 'tester' | 'stakeholder';
  status: 'online' | 'offline' | 'away' | 'busy';
  profileColor: string;
  skills: string[];
  availability: number; // percentage
  teamIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  members: TeamMember[];
  ownerId: string;
  inviteLink: string;
  stage: 'forming' | 'storming' | 'norming' | 'performing' | 'adjourning';
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  role: string;
  raciRole: 'responsible' | 'accountable' | 'consulted' | 'informed';
  joinedAt: Date;
  performance: {
    rating: number;
    feedback: string[];
    conflicts: number;
  };
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  projectId: string;
  status: 'backlog' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyPoints: number;
  stories: string[]; // story IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  asA: string; // "As a..."
  iWant: string; // "I want..."
  soThat: string; // "So that..."
  acceptanceCriteria: string[];
  epicId?: string;
  sprintId?: string;
  projectId: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  storyPoints: number;
  estimationVotes: PlanningPokerVote[];
  tasks: string[]; // task IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanningPokerVote {
  userId: string;
  vote: number;
  timestamp: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  storyId?: string;
  projectId: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  estimatedHours: number;
  actualHours: number;
  dueDate?: Date;
  tags: string[];
  dependencies: string[]; // task IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'review' | 'retrospective' | 'completed';
  stories: string[]; // story IDs
  capacity: number; // total story points
  velocity: number; // completed story points
  burndownData: BurndownPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BurndownPoint {
  date: Date;
  remainingPoints: number;
  idealRemaining: number;
}

export interface DailyStandup {
  id: string;
  userId: string;
  sprintId: string;
  date: Date;
  yesterday: string;
  today: string;
  blockers: string;
  mood: 'great' | 'good' | 'okay' | 'struggling' | 'blocked';
}

export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'internal' | 'external';
  role: string;
  priority: 'high' | 'medium' | 'low';
  powerLevel: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
  interestLevel: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
  communicationPlan: CommunicationPlan;
  projectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationPlan {
  preferredMedium: 'email' | 'slack' | 'teams' | 'phone' | 'in_person';
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'as_needed';
  escalationPath: string[];
  notes: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature_request' | 'technical_debt' | 'blocker' | 'question';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  stakeholderId?: string;
  projectId: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Risk {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'schedule' | 'budget' | 'resource' | 'external' | 'quality';
  probability: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  impact: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  riskScore: number; // probability * impact
  mitigationPlan: string;
  contingencyPlan: string;
  owner: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'monitoring' | 'closed';
  projectId: string;
  sprintId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  projectId: string;
  initialEstimate: number;
  allocations: BudgetAllocation[];
  actualSpend: number;
  plannedValue: number; // PV
  earnedValue: number; // EV
  actualCost: number; // AC
  costVariance: number; // CV = EV - AC
  scheduleVariance: number; // SV = EV - PV
  cpi: number; // Cost Performance Index = EV / AC
  spi: number; // Schedule Performance Index = EV / PV
  burnRate: number; // spending per time period
  forecastAtCompletion: number; // EAC
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

export interface QualityMetrics {
  id: string;
  projectId: string;
  sprintId?: string;
  testCases: TestCase[];
  defects: Defect[];
  testCoverage: number;
  passRate: number;
  defectDensity: number;
  meanTimeToResolution: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'not_run' | 'passed' | 'failed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  storyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  foundBy: string;
  assignedTo?: string;
  stepsToReproduce: string[];
  environment: string;
  resolution?: string;
  testCaseId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectReport {
  id: string;
  type: 'sprint_summary' | 'velocity' | 'burndown' | 'budget' | 'quality' | 'risk' | 'stakeholder';
  projectId: string;
  sprintId?: string;
  data: any;
  generatedBy: string;
  exportFormat: 'pdf' | 'excel' | 'json';
  createdAt: Date;
}

export interface CommunicationLog {
  id: string;
  type: 'email' | 'meeting' | 'slack' | 'phone' | 'document';
  subject: string;
  content: string;
  from: string;
  to: string[];
  stakeholderIds: string[];
  projectId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'responded';
}

export interface ProjectSelection {
  id: string;
  name: string;
  description: string;
  npv: number;
  roi: number;
  paybackPeriod: number;
  weightedScore: number;
  strategicFit: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'proposed' | 'approved' | 'rejected' | 'on_hold';
  criteria: SelectionCriteria[];
  createdAt: Date;
}

export interface SelectionCriteria {
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
}