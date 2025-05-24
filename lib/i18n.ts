export type Language = "en" | "cs"

export interface Translations {
  // Navigation and general
  appName: string
  appDescription: string

  // Home page
  createNewEvent: string
  startPlanning: string
  eventName: string
  eventNamePlaceholder: string
  yourName: string
  yourNamePlaceholder: string
  createEvent: string
  howItWorks: string
  createEventStep: string
  createEventDesc: string
  shareLinkStep: string
  shareLinkDesc: string
  findBestDatesStep: string
  findBestDatesDesc: string
  noRegistration: string

  // Event page
  organizedBy: string
  participants: string
  participantsCount: string
  copyLink: string
  copied: string
  addYourAvailability: string
  selectDatesDesc: string
  joinEvent: string
  enterYourName: string
  availableDates: string
  addAvailability: string
  cancel: string
  save: string

  // Date picker
  addSelectedDate: string
  selectedDates: string
  removeDate: string
  deleteAll: string
  delete: string
  confirm: string
  deleteDateTitle: string
  deleteDateDescription: string
  deleteAllDatesTitle: string
  deleteAllDatesDescription: string
  editDatesFor: string
  editDatesDescription: string

  // Availability heatmap
  availabilityOverview: string
  availabilityDesc: string
  noParticipantsYet: string
  shareToStart: string
  bestDates: string
  bestDatesDesc: string
  people: string
  availabilityHeatmap: string
  visualOverview: string
  noDatesSelected: string
  availabilityScale: string
  low: string
  medium: string
  high: string

  // Participants
  peopleJoined: string
  dates: string
  deleteParticipantTitle: string
  deleteParticipantDescription: string

  // Error states
  eventNotFound: string
  eventNotFoundDesc: string

  // Days of week
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string

  // Months
  january: string
  february: string
  march: string
  april: string
  may: string
  june: string
  july: string
  august: string
  september: string
  october: string
  november: string
  december: string

  // Activity suggestions
  activitySuggestions: string
  suggestActivity: string
  activityName: string
  activityDescription: string
  activityNamePlaceholder: string
  activityDescriptionPlaceholder: string
  addSuggestion: string
  voteForThis: string
  removeVote: string
  votes: string
  vote: string
  noSuggestionsYet: string
  suggestFirst: string
  suggestedBy: string
  mostPopular: string
  like: string
  dislike: string
  dontCare: string
  likes: string
  dislikes: string
  neutral: string
  yourVote: string
  changeVote: string
  removeYourVote: string
  score: string
  deleteActivityTitle: string
  deleteActivityDescription: string

  // Enhanced editing
  editYourDates: string
  editYourActivities: string
  showLess: string
  showMore: string
  editDates: string
  editActivity: string
}

export const translations: Record<Language, Translations> = {
  cs: {
    appName: "DateSync",
    appDescription: "Koordinujte termíny s vaší skupinou bez námahy. Najděte perfektní čas, který vyhovuje všem.",

    createNewEvent: "Vytvořit novou akci",
    startPlanning: "Začněte plánovat vaši skupinovou akci nebo výlet",
    eventName: "Název akce",
    eventNamePlaceholder: "Víkendový výlet do hor",
    yourName: "Vaše jméno",
    yourNamePlaceholder: "Jan Novák",
    createEvent: "Vytvořit akci",
    howItWorks: "Jak to funguje",
    createEventStep: "Vytvořit akci",
    createEventDesc: "Nastavte vaši akci a získejte odkaz ke sdílení",
    shareLinkStep: "Sdílet odkaz",
    shareLinkDesc: "Pošlete odkaz všem účastníkům",
    findBestDatesStep: "Najít nejlepší termíny",
    findBestDatesDesc: "Podívejte se, které termíny vyhovují většině lidí",
    noRegistration: "Není nutná registrace • Zdarma • Sdílejte s neomezeným počtem účastníků",

    organizedBy: "Organizuje",
    participants: "účastníci",
    participantsCount: "účastníků",
    copyLink: "Kopírovat odkaz",
    copied: "Zkopírováno!",
    addYourAvailability: "Přidat vaši dostupnost",
    selectDatesDesc: "Vyberte termíny, kdy jste k dispozici",
    joinEvent: "Připojit se k akci",
    enterYourName: "Zadejte vaše jméno",
    availableDates: "Dostupné termíny",
    addAvailability: "Přidat dostupnost",
    cancel: "Zrušit",
    save: "Uložit",

    addSelectedDate: "Přidat vybraný termín",
    selectedDates: "Vybrané termíny:",
    removeDate: "Odebrat termín",
    deleteAll: "Smazat vše",
    delete: "Smazat",
    confirm: "Potvrdit",
    deleteDateTitle: "Smazat termín",
    deleteDateDescription: "Opravdu chcete smazat tento termín?",
    deleteAllDatesTitle: "Smazat všechny termíny",
    deleteAllDatesDescription: "Opravdu chcete smazat všechny vybrané termíny?",
    editDatesFor: "Upravit termíny pro",
    editDatesDescription: "Vyberte nové termíny dostupnosti",

    availabilityOverview: "Přehled dostupnosti",
    availabilityDesc: "Dostupnost termínů se zobrazí zde, jakmile se připojí účastníci",
    noParticipantsYet: "Zatím žádní účastníci. Sdílejte odkaz a začněte!",
    shareToStart: "Sdílejte odkaz a začněte!",
    bestDates: "Nejlepší termíny",
    bestDatesDesc: "Termíny, které vyhovují většině lidí",
    people: "lidí",
    availabilityHeatmap: "Mapa dostupnosti",
    visualOverview: "Vizuální přehled kdy jsou lidé k dispozici",
    noDatesSelected: "Zatím nebyly vybrány žádné termíny",
    availabilityScale: "Škála obsazenosti:",
    low: "Nízká",
    medium: "Střední",
    high: "Vysoká",

    peopleJoined: "lidí se připojilo",
    dates: "termínů",
    deleteParticipantTitle: "Smazat účastníka",
    deleteParticipantDescription: "Opravdu chcete smazat tohoto účastníka a všechny jeho dostupné termíny?",

    eventNotFound: "Akce nenalezena",
    eventNotFoundDesc: "Tato akce neexistuje nebo byla odstraněna.",

    monday: "Pondělí",
    tuesday: "Úterý",
    wednesday: "Středa",
    thursday: "Čtvrtek",
    friday: "Pátek",
    saturday: "Sobota",
    sunday: "Neděle",

    january: "Leden",
    february: "Únor",
    march: "Březen",
    april: "Duben",
    may: "Květen",
    june: "Červen",
    july: "Červenec",
    august: "Srpen",
    september: "Září",
    october: "Říjen",
    november: "Listopad",
    december: "Prosinec",

    // Activity suggestions
    activitySuggestions: "Návrhy aktivit",
    suggestActivity: "Navrhnout aktivitu",
    activityName: "Název aktivity",
    activityDescription: "Popis aktivity",
    activityNamePlaceholder: "Například: Grilování",
    activityDescriptionPlaceholder: "Podrobnosti o aktivitě",
    addSuggestion: "Přidat návrh",
    voteForThis: "Hlasovat pro tuto aktivitu",
    removeVote: "Odebrat hlas",
    votes: "Hlasů",
    vote: "Hlasovat",
    noSuggestionsYet: "Zatím žádné návrhy. Buďte první!",
    suggestFirst: "Navrhněte první aktivitu!",
    suggestedBy: "Navrhl",
    mostPopular: "Nejoblíbenější",
    like: "Líbí se mi",
    dislike: "Nelíbí se mi",
    dontCare: "Je mi to jedno",
    likes: "Líbí se",
    dislikes: "Nelíbí se",
    neutral: "Neutrální",
    yourVote: "Tvůj hlas",
    changeVote: "Změnit hlas",
    removeYourVote: "Odebrat tvůj hlas",
    score: "Skóre",
    deleteActivityTitle: "Smazat aktivitu",
    deleteActivityDescription: "Opravdu chcete smazat tuto aktivitu?",

    // Enhanced editing
    editYourDates: "Upravit vaše termíny",
    editYourActivities: "Upravit vaše aktivity",
    showLess: "Zobrazit méně",
    showMore: "Zobrazit více",
    editDates: "Upravit termíny",
    editActivity: "Upravit aktivitu",
  },
  en: {
    appName: "DateSync",
    appDescription: "Coordinate dates with your group effortlessly. Find the perfect time that suits everyone.",

    createNewEvent: "Create New Event",
    startPlanning: "Start planning your group event or trip",
    eventName: "Event Name",
    eventNamePlaceholder: "Weekend trip to the mountains",
    yourName: "Your Name",
    yourNamePlaceholder: "John Doe",
    createEvent: "Create Event",
    howItWorks: "How it works",
    createEventStep: "Create Event",
    createEventDesc: "Set up your event and get a shareable link",
    shareLinkStep: "Share Link",
    shareLinkDesc: "Send the link to all participants",
    findBestDatesStep: "Find Best Dates",
    findBestDatesDesc: "See which dates suit most people",
    noRegistration: "No registration needed • Free • Share with unlimited participants",

    organizedBy: "Organized by",
    participants: "participants",
    participantsCount: "participants",
    copyLink: "Copy Link",
    copied: "Copied!",
    addYourAvailability: "Add Your Availability",
    selectDatesDesc: "Select dates when you are available",
    joinEvent: "Join Event",
    enterYourName: "Enter Your Name",
    availableDates: "Available Dates",
    addAvailability: "Add Availability",
    cancel: "Cancel",
    save: "Save",

    addSelectedDate: "Add Selected Date",
    selectedDates: "Selected Dates:",
    removeDate: "Remove Date",
    deleteAll: "Delete All",
    delete: "Delete",
    confirm: "Confirm",
    deleteDateTitle: "Delete Date",
    deleteDateDescription: "Are you sure you want to delete this date?",
    deleteAllDatesTitle: "Delete All Dates",
    deleteAllDatesDescription: "Are you sure you want to delete all selected dates?",
    editDatesFor: "Edit Dates for",
    editDatesDescription: "Select new availability dates",

    availabilityOverview: "Availability Overview",
    availabilityDesc: "Date availability will be shown here once participants join",
    noParticipantsYet: "No participants yet. Share the link to get started!",
    shareToStart: "Share the link to get started!",
    bestDates: "Best Dates",
    bestDatesDesc: "Dates that suit most people",
    people: "people",
    availabilityHeatmap: "Availability Heatmap",
    visualOverview: "Visual overview of when people are available",
    noDatesSelected: "No dates selected yet",
    availabilityScale: "Occupancy Scale:",
    low: "Low",
    medium: "Medium",
    high: "High",

    peopleJoined: "people joined",
    dates: "dates",
    deleteParticipantTitle: "Delete Participant",
    deleteParticipantDescription: "Are you sure you want to delete this participant and all their available dates?",

    eventNotFound: "Event Not Found",
    eventNotFoundDesc: "This event does not exist or has been removed.",

    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",

    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",

    // Activity suggestions
    activitySuggestions: "Activity Suggestions",
    suggestActivity: "Suggest Activity",
    activityName: "Activity Name",
    activityDescription: "Activity Description",
    activityNamePlaceholder: "e.g., Barbecue",
    activityDescriptionPlaceholder: "Details about the activity",
    addSuggestion: "Add Suggestion",
    voteForThis: "Vote for this activity",
    removeVote: "Remove Vote",
    votes: "Votes",
    vote: "Vote",
    noSuggestionsYet: "No suggestions yet. Be the first!",
    suggestFirst: "Suggest the first activity!",
    suggestedBy: "Suggested by",
    mostPopular: "Most Popular",
    like: "Like",
    dislike: "Dislike",
    dontCare: "Don't Care",
    likes: "Likes",
    dislikes: "Dislikes",
    neutral: "Neutral",
    yourVote: "Your Vote",
    changeVote: "Change Vote",
    removeYourVote: "Remove Your Vote",
    score: "Score",
    deleteActivityTitle: "Delete Activity",
    deleteActivityDescription: "Are you sure you want to delete this activity?",

    // Enhanced editing
    editYourDates: "Edit your dates",
    editYourActivities: "Edit your activities",
    showLess: "Show less",
    showMore: "Show more",
    editDates: "Edit dates",
    editActivity: "Edit activity",
  },
}

export function useTranslation(language: Language = "cs") {
  return translations[language]
}

export function formatDate(date: Date, language: Language = "cs"): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  if (language === "cs") {
    options.month = "long"
  }

  return date.toLocaleDateString(language === "cs" ? "cs-CZ" : "en-US", options)
}
