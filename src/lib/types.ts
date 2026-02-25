export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string; // es. new Date().toISOString()

export type PainLevel = 0 | 1 | 2 | 3 | 4;
export type FlowIntensity = "light" | "medium" | "heavy";

export type MedicationType = "topical" | "oral" | "suppository" | "other";

export type SwabTestResult = "positivo" | "negativo" | "non_eseguito";

export type SwabTestInfo = {
  result: SwabTestResult;
  note: string | null;
};

export type FeatureToggles = {
  voidingDiaryEnabled: boolean;
};

export type MedicationLight = {
  id: string;
  name: string;
  type: MedicationType;
  note: string;
  active: boolean;
};

export type Profile = {
  name: string | null;
  age: number | null;
  diagnosisDate: ISODate | null;
  swabTest: SwabTestInfo;
  currentTherapies: MedicationLight[];
  features: FeatureToggles;
};

export type DailyLog = {
  id: string;
  date: ISODate;
  painLevel: PainLevel;
  menstruation: boolean;
  flowIntensity: FlowIntensity | null;
  therapyAdherenceSimple: boolean | null;
  notes: string; // max 500 chars (enforced in UI)
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type DailyLogDraft = Omit<DailyLog, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: ISODateTime;
  updatedAt?: ISODateTime;
};

export type VoidingEntry = {
  id: string;
  date: ISODate;
  timestamp: ISODateTime;
  volumeMl: number | null;
  urgency: 1 | 2 | 3 | 4 | 5;
  pain: boolean;
  painIntensity: PainLevel;
  notes: string;
};

export type Appointment = {
  id: string;
  date: ISODate;
  time: string; // 'HH:mm'
  doctorName: string;
  specialty: string;
  location: string | null;
  notes: string;
};

export type DynaData = {
  profile: Profile;
  dailyLogs: DailyLog[];
  medications: MedicationLight[];
  voidingEntries: VoidingEntry[];
  appointments: Appointment[];
};

