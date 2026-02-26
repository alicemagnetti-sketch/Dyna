export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string; // es. new Date().toISOString()

export type PainLevel = 0 | 1 | 2 | 3 | 4;
export type FlowIntensity = "light" | "medium" | "heavy";

export type MedicationType = "topical" | "oral" | "suppository" | "other";

export type SwabTestResult = "positivo" | "negativo" | "non_eseguito";

/** Punteggi 1-10 per le 5 zone (L3 Swab Test) */
export type SwabScores = {
  clitoride: number | null;
  orefizioUretrale: number | null;
  labbroDestro: number | null;
  labbroSinistro: number | null;
  forchetta: number | null;
};

export type SwabTestInfo = {
  result: SwabTestResult;
  note: string | null;
  /** @deprecated usare swabVisits per visite con risultati */
  scores?: SwabScores | null;
};

/** Visita con swab test: data visita + risultati 1-10 per le 5 zone */
export type SwabVisit = {
  id: string;
  date: ISODate;
  swabScores: SwabScores;
};

export type SpecialistType = "ginecologo" | "nutrizionista" | "fisioterapista" | "altro";

export type Specialist = {
  id: string;
  type: SpecialistType;
  typeOther?: string | null;
  startDate: ISODate;
  endDate: ISODate | null;
  stillActive: boolean;
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
  /** Legacy: usato se firstName/lastName assenti */
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: ISODate | null;
  age: number | null;
  diagnosisDate: ISODate | null;
  specialists: Specialist[];
  swabTest: SwabTestInfo;
  /** Visite con swab test (data visita + risultati per zona) */
  swabVisits: SwabVisit[];
  currentTherapies: MedicationLight[];
  features: FeatureToggles;
  /** Se true, nasconde la voce Supporto nel profilo */
  supportRemoved?: boolean;
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

export type FluidIntakeType = "acqua" | "caffe" | "te" | "succo" | "altro";

export type FluidIntake = {
  id: string;
  diaryId: string;
  date: ISODate;
  timestamp: ISODateTime;
  type: FluidIntakeType;
  volume_ml: number;
  label?: string;
};

export type VoidingEntry = {
  id: string;
  diaryId: string;
  date: ISODate;
  timestamp: ISODateTime;
  volume_ml: number | null;
  urgency: boolean;
  burning: boolean;
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
  fluidIntakes: FluidIntake[];
  voidingEntries: VoidingEntry[];
  appointments: Appointment[];
};

