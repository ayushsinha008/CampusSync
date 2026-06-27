export type AcademicProgram = {
  id: string;
  name: string;
  label: string;
};

export type AcademicDepartment = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  programs: AcademicProgram[];
};

export const ACADEMIC_CATALOG: AcademicDepartment[] = [
  {
    id: 'engineering',
    name: 'Engineering',
    shortName: 'ENG',
    description: 'B.Tech & engineering programs',
    programs: [
      { id: 'cse', name: 'CSE', label: 'Computer Science & Engineering' },
      { id: 'aiml', name: 'AIML', label: 'AI & Machine Learning' },
      { id: 'ece', name: 'ECE', label: 'Electronics & Communication' },
      { id: 'me', name: 'ME', label: 'Mechanical Engineering' },
    ],
  },
  {
    id: 'law',
    name: 'Law',
    shortName: 'LLB',
    description: 'Law & legal studies',
    programs: [
      { id: 'llb', name: 'LLB', label: 'LLB (3 Year)' },
      { id: 'ballb', name: 'BA LLB', label: 'Integrated BA LLB' },
    ],
  },
  {
    id: 'management',
    name: 'Management',
    shortName: 'MBA',
    description: 'Business & management',
    programs: [
      { id: 'bba', name: 'BBA', label: 'Bachelor of Business Administration' },
      { id: 'mba', name: 'MBA', label: 'Master of Business Administration' },
    ],
  },
  {
    id: 'arts',
    name: 'Arts & Science',
    shortName: 'ARTS',
    description: 'Commerce, science & humanities',
    programs: [
      { id: 'bcom', name: 'B.Com', label: 'Bachelor of Commerce' },
      { id: 'bsc', name: 'B.Sc', label: 'Bachelor of Science' },
    ],
  },
];

const BRANCH_TO_PROGRAM: Record<string, { department: string; program: string }> = {
  'computer science': { department: 'engineering', program: 'cse' },
  cse: { department: 'engineering', program: 'cse' },
  'ai & machine learning': { department: 'engineering', program: 'aiml' },
  aiml: { department: 'engineering', program: 'aiml' },
  'electronics & communication': { department: 'engineering', program: 'ece' },
  ece: { department: 'engineering', program: 'ece' },
  'mechanical engineering': { department: 'engineering', program: 'me' },
  me: { department: 'engineering', program: 'me' },
  llb: { department: 'law', program: 'llb' },
  'ba llb': { department: 'law', program: 'ballb' },
  bba: { department: 'management', program: 'bba' },
  mba: { department: 'management', program: 'mba' },
  'b.com': { department: 'arts', program: 'bcom' },
  bcom: { department: 'arts', program: 'bcom' },
  'b.sc': { department: 'arts', program: 'bsc' },
  bsc: { department: 'arts', program: 'bsc' },
};

export function getDepartment(id: string) {
  return ACADEMIC_CATALOG.find((d) => d.id === id);
}

export function getProgram(departmentId: string, programId: string) {
  return getDepartment(departmentId)?.programs.find((p) => p.id === programId);
}

export function resolveStudentProgram(branch?: string) {
  if (!branch) return null;
  return BRANCH_TO_PROGRAM[branch.trim().toLowerCase()] ?? null;
}

export function isValidDepartmentProgram(departmentId: string, programId: string) {
  return Boolean(getProgram(departmentId, programId));
}
