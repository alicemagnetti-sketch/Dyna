## Dyna – Documento di lavoro MVP (locale, senza backend)

### Contesto

Dyna è una PWA mobile-first (Next.js + Tailwind) pensata per una singola utente, con tutti i dati salvati in locale sul dispositivo (browser) tramite `localStorage`. Non è previsto alcun backend o sincronizzazione multi-device in questa fase.

Obiettivi MVP:

- Check-in giornaliero (dolore, ciclo, note, aderenza semplice alla terapia).

- Calendario con stato dei giorni.

- Profilo con dati rilevanti (nome, età, diagnosi, swab test, terapie correnti).

- Elenco light di terapie correnti.

- Diario minzionale attivabile come feature opzionale.

---

### 1. Schema dati locale (riassunto)

Chiave unica di localStorage: `dyna_data_v1`, contenente un oggetto `DynaData` con:

- `profile: Profile`

- `dailyLogs: DailyLog[]`

- `medications: MedicationLight[]`

- `voidingEntries: VoidingEntry[]`

- `appointments: Appointment[]`

(Il dettaglio di questi tipi sarà nel codice TypeScript in `lib/types.ts`.)

---

### 2. Mappa pagine Next.js (riassunto)

- `/onboarding/*`: raccolta dati iniziali (nome, età, diagnosi, swab test, terapie correnti).

- `/`: home con calendario + stato check-in del giorno.

- `/log/[date]`: dettaglio giorno + flow check-in.

- `/therapies`: lista terapie correnti (add/edit).

- `/profile`: profilo, toggle diario minzionale, export JSON dati.

- `/voiding`: diario minzionale (quando attivato).