/*
 * Mathe-Schatzreise - app.js
 * Vanilla JavaScript game engine for an offline math adventure.
 *
 * Structure:
 *   1. Language list + i18n dictionary (German is the canonical fallback).
 *   2. Pure math generators + validation helpers (also exported for tests).
 *   3. Persistent storage helpers (localStorage).
 *   4. UI controller (screens, number pad, adventure map, rewards).
 *
 * The math/i18n core is written so it can run under Node.js for unit tests:
 * all DOM/browser access is guarded and the bootstrap only runs in a browser.
 */

"use strict";

/* ================================================================== */
/* 1. Languages + i18n dictionary                                      */
/* ================================================================== */

// Order matters: German must be first. Native labels are used in the UI.
var LANGUAGES = [
  {
    code: "de",
    label: "Deutsch",
    flag: "\uD83C\uDDE9\uD83C\uDDEA",
    dir: "ltr",
  },
  {
    code: "en",
    label: "English",
    flag: "\uD83C\uDDEC\uD83C\uDDE7",
    dir: "ltr",
  },
  {
    code: "es",
    label: "Espa\u00f1ol",
    flag: "\uD83C\uDDEA\uD83C\uDDF8",
    dir: "ltr",
  },
  {
    code: "fr",
    label: "Fran\u00e7ais",
    flag: "\uD83C\uDDEB\uD83C\uDDF7",
    dir: "ltr",
  },
  {
    code: "it",
    label: "Italiano",
    flag: "\uD83C\uDDEE\uD83C\uDDF9",
    dir: "ltr",
  },
  {
    code: "pt",
    label: "Portugu\u00eas",
    flag: "\uD83C\uDDF5\uD83C\uDDF9",
    dir: "ltr",
  },
  {
    code: "nl",
    label: "Nederlands",
    flag: "\uD83C\uDDF3\uD83C\uDDF1",
    dir: "ltr",
  },
  { code: "pl", label: "Polski", flag: "\uD83C\uDDF5\uD83C\uDDF1", dir: "ltr" },
  {
    code: "uk",
    label: "\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430",
    flag: "\uD83C\uDDFA\uD83C\uDDE6",
    dir: "ltr",
  },
  {
    code: "ru",
    label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
    flag: "\uD83C\uDDF7\uD83C\uDDFA",
    dir: "ltr",
  },
  {
    code: "tr",
    label: "T\u00fcrk\u00e7e",
    flag: "\uD83C\uDDF9\uD83C\uDDF7",
    dir: "ltr",
  },
  {
    code: "ar",
    label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    flag: "\uD83C\uDDF8\uD83C\uDDE6",
    dir: "rtl",
  },
  {
    code: "hi",
    label: "\u0939\u093f\u0928\u094d\u0926\u0940",
    flag: "\uD83C\uDDEE\uD83C\uDDF3",
    dir: "ltr",
  },
  {
    code: "zh",
    label: "\u4e2d\u6587",
    flag: "\uD83C\uDDE8\uD83C\uDDF3",
    dir: "ltr",
  },
  {
    code: "ja",
    label: "\u65e5\u672c\u8a9e",
    flag: "\uD83C\uDDEF\uD83C\uDDF5",
    dir: "ltr",
  },
  {
    code: "ko",
    label: "\ud55c\uad6d\uc5b4",
    flag: "\uD83C\uDDF0\uD83C\uDDF7",
    dir: "ltr",
  },
];

/*
 * I18N dictionary. Every language provides the same set of keys.
 * German (de) is the canonical reference and the fallback for missing keys.
 * Templated strings use {n} / {total} placeholders.
 */
var I18N = {
  de: {
    lang_title: "W\u00e4hle deine Sprache",
    lang_hint: "Du kannst sie sp\u00e4ter in den Einstellungen \u00e4ndern.",
    tagline: "L\u00f6se Rechen-R\u00e4tsel und finde den gro\u00dfen Schatz!",
    btn_play: "Abenteuer starten",
    btn_settings: "Einstellungen",
    btn_howto: "So wird gespielt",
    btn_back: "Zur\u00fcck",
    btn_start: "Los geht's!",
    btn_check: "Pr\u00fcfen",
    btn_hint: "Tipp",
    btn_resume: "Weiter",
    btn_quit: "Beenden",
    btn_menu: "Hauptmen\u00fc",
    mode_title: "W\u00e4hle deine Rechenart",
    m_add: "Plus-Rechnen",
    m_sub: "Minus-Rechnen",
    m_mul: "Mal-Rechnen",
    m_mix: "Bunte Mischung",
    m_add_desc: "Addiere 2 oder 3 Zahlen bis 100.",
    m_sub_desc: "Ziehe Zahlen bis 100 ab.",
    m_mul_desc: "Das kleine Einmaleins.",
    m_mix_desc: "Alles wild gemischt.",
    diff_title: "Schwierigkeit",
    d_adaptive: "Mitwachsend",
    d_easy: "Leicht",
    d_medium: "Mittel",
    d_hard: "Schwer",
    feedback_correct: "Richtig! Super gemacht!",
    feedback_wrong: "Fast! Schau dir den Tipp an.",
    lbl_stars: "Sterne",
    lbl_coins: "M\u00fcnzen",
    lbl_accuracy: "Treffer",
    lbl_best_streak: "Beste Serie",
    run_complete: "Reise geschafft!",
    treasure_found: "Du hast den Schatz gefunden!",
    set_title: "Einstellungen",
    set_sound: "T\u00f6ne",
    set_timer: "Zeit-Modus",
    set_quick: "Schnelle Runde (10 Aufgaben)",
    set_lang: "Sprache",
    set_reset: "Fortschritt zur\u00fccksetzen",
    reset_confirm: "Wirklich allen Fortschritt l\u00f6schen?",
    howto_title: "So wird gespielt",
    howto_body:
      "Reise \u00fcber die Karte und l\u00f6se an jeder Station eine Rechenaufgabe. Tippe deine Antwort mit den gro\u00dfen Tasten ein und dr\u00fccke auf Pr\u00fcfen. Sammle Sterne, M\u00fcnzen und Abzeichen. Am Ende jeder Reise wartet eine Schatztruhe auf dich!",
    play_again: "Neue Reise",
    paused: "Pause",
    station_progress: "Station {n} von {total}",
    well_done: "Klasse gemacht!",
    new_badge: "Neues Abzeichen!",
    set_blitz: "Blitz-Aufgaben mit Timer",
    set_choices: "Antwort-Knöpfe statt Tippen",
    choose_answer: "Tippe die richtige Antwort an",
    blitz_tag: "Blitz!",
    combo_tag: "Combo ×{x}",
    time_bonus: "Zeit-Bonus +{n}",
    daily_bonus: "Tagesbonus +{n} Münzen!",
    timeout_msg: "Zeit um! Die nächste schaffst du.",
    review_title: "Das üben wir nochmal",
    praise_1: "Super!",
    praise_2: "Stark!",
    praise_3: "Weiter so!",
    encourage_1: "Fast!",
    encourage_2: "Gleich hast du es!",
    encourage_3: "Nicht aufgeben!",
  },
  en: {
    lang_title: "Choose your language",
    lang_hint: "You can change it later in the settings.",
    tagline: "Solve number puzzles and find the great treasure!",
    btn_play: "Start adventure",
    btn_settings: "Settings",
    btn_howto: "How to play",
    btn_back: "Back",
    btn_start: "Let's go!",
    btn_check: "Check",
    btn_hint: "Hint",
    btn_resume: "Continue",
    btn_quit: "Quit",
    btn_menu: "Main menu",
    mode_title: "Choose your math",
    m_add: "Addition",
    m_sub: "Subtraction",
    m_mul: "Multiplication",
    m_mix: "Colorful mix",
    m_add_desc: "Add 2 or 3 numbers up to 100.",
    m_sub_desc: "Subtract numbers up to 100.",
    m_mul_desc: "The times tables.",
    m_mix_desc: "Everything mixed together.",
    diff_title: "Difficulty",
    d_adaptive: "Adaptive",
    d_easy: "Easy",
    d_medium: "Medium",
    d_hard: "Hard",
    feedback_correct: "Correct! Well done!",
    feedback_wrong: "Almost! Take a look at the hint.",
    lbl_stars: "Stars",
    lbl_coins: "Coins",
    lbl_accuracy: "Accuracy",
    lbl_best_streak: "Best streak",
    run_complete: "Journey complete!",
    treasure_found: "You found the treasure!",
    set_title: "Settings",
    set_sound: "Sounds",
    set_timer: "Timer mode",
    set_quick: "Quick run (10 tasks)",
    set_lang: "Language",
    set_reset: "Reset progress",
    reset_confirm: "Really delete all progress?",
    howto_title: "How to play",
    howto_body:
      "Travel across the map and solve a math task at every station. Type your answer with the big keys and press Check. Collect stars, coins and badges. A treasure chest waits at the end of every journey!",
    play_again: "New journey",
    paused: "Paused",
    station_progress: "Station {n} of {total}",
    well_done: "Great job!",
    new_badge: "New badge!",
    set_blitz: "Lightning tasks with timer",
    set_choices: "Answer buttons instead of typing",
    choose_answer: "Tap the correct answer",
    blitz_tag: "Blitz!",
    combo_tag: "Combo ×{x}",
    time_bonus: "Time bonus +{n}",
    daily_bonus: "Daily bonus +{n} coins!",
    timeout_msg: "Time's up! You'll get the next one.",
    review_title: "Let's practice these again",
    praise_1: "Awesome!",
    praise_2: "Great!",
    praise_3: "Keep going!",
    encourage_1: "Almost!",
    encourage_2: "Nearly there!",
    encourage_3: "Don't give up!",
  },
  es: {
    lang_title: "Elige tu idioma",
    lang_hint: "Puedes cambiarlo m\u00e1s tarde en los ajustes.",
    tagline:
      "\u00a1Resuelve acertijos de n\u00fameros y encuentra el gran tesoro!",
    btn_play: "Empezar aventura",
    btn_settings: "Ajustes",
    btn_howto: "C\u00f3mo jugar",
    btn_back: "Atr\u00e1s",
    btn_start: "\u00a1Vamos!",
    btn_check: "Comprobar",
    btn_hint: "Pista",
    btn_resume: "Continuar",
    btn_quit: "Salir",
    btn_menu: "Men\u00fa principal",
    mode_title: "Elige tu c\u00e1lculo",
    m_add: "Sumas",
    m_sub: "Restas",
    m_mul: "Multiplicaci\u00f3n",
    m_mix: "Mezcla colorida",
    m_add_desc: "Suma 2 o 3 n\u00fameros hasta 100.",
    m_sub_desc: "Resta n\u00fameros hasta 100.",
    m_mul_desc: "Las tablas de multiplicar.",
    m_mix_desc: "Todo mezclado.",
    diff_title: "Dificultad",
    d_adaptive: "Adaptable",
    d_easy: "F\u00e1cil",
    d_medium: "Media",
    d_hard: "Dif\u00edcil",
    feedback_correct: "\u00a1Correcto! \u00a1Muy bien!",
    feedback_wrong: "\u00a1Casi! Mira la pista.",
    lbl_stars: "Estrellas",
    lbl_coins: "Monedas",
    lbl_accuracy: "Aciertos",
    lbl_best_streak: "Mejor racha",
    run_complete: "\u00a1Viaje completado!",
    treasure_found: "\u00a1Has encontrado el tesoro!",
    set_title: "Ajustes",
    set_sound: "Sonidos",
    set_timer: "Modo tiempo",
    set_quick: "Ronda r\u00e1pida (10 tareas)",
    set_lang: "Idioma",
    set_reset: "Reiniciar progreso",
    reset_confirm: "\u00bfBorrar todo el progreso?",
    howto_title: "C\u00f3mo jugar",
    howto_body:
      "Viaja por el mapa y resuelve una tarea en cada estaci\u00f3n. Escribe tu respuesta con las teclas grandes y pulsa Comprobar. Re\u00fane estrellas, monedas e insignias. \u00a1Un cofre del tesoro te espera al final de cada viaje!",
    play_again: "Nuevo viaje",
    paused: "Pausa",
    station_progress: "Estaci\u00f3n {n} de {total}",
    well_done: "\u00a1Bien hecho!",
    new_badge: "\u00a1Nueva insignia!",
  },
  fr: {
    lang_title: "Choisis ta langue",
    lang_hint: "Tu pourras la changer plus tard dans les r\u00e9glages.",
    tagline:
      "R\u00e9sous des \u00e9nigmes de calcul et trouve le grand tr\u00e9sor !",
    btn_play: "Commencer l'aventure",
    btn_settings: "R\u00e9glages",
    btn_howto: "Comment jouer",
    btn_back: "Retour",
    btn_start: "C'est parti !",
    btn_check: "V\u00e9rifier",
    btn_hint: "Indice",
    btn_resume: "Continuer",
    btn_quit: "Quitter",
    btn_menu: "Menu principal",
    mode_title: "Choisis ton calcul",
    m_add: "Additions",
    m_sub: "Soustractions",
    m_mul: "Multiplications",
    m_mix: "M\u00e9lange color\u00e9",
    m_add_desc: "Additionne 2 ou 3 nombres jusqu'\u00e0 100.",
    m_sub_desc: "Soustrais des nombres jusqu'\u00e0 100.",
    m_mul_desc: "Les tables de multiplication.",
    m_mix_desc: "Tout m\u00e9lang\u00e9.",
    diff_title: "Difficult\u00e9",
    d_adaptive: "\u00c9volutive",
    d_easy: "Facile",
    d_medium: "Moyen",
    d_hard: "Difficile",
    feedback_correct: "Correct ! Bravo !",
    feedback_wrong: "Presque ! Regarde l'indice.",
    lbl_stars: "\u00c9toiles",
    lbl_coins: "Pi\u00e8ces",
    lbl_accuracy: "R\u00e9ussite",
    lbl_best_streak: "Meilleure s\u00e9rie",
    run_complete: "Voyage termin\u00e9 !",
    treasure_found: "Tu as trouv\u00e9 le tr\u00e9sor !",
    set_title: "R\u00e9glages",
    set_sound: "Sons",
    set_timer: "Mode chrono",
    set_quick: "Partie rapide (10 t\u00e2ches)",
    set_lang: "Langue",
    set_reset: "R\u00e9initialiser la progression",
    reset_confirm: "Vraiment tout effacer ?",
    howto_title: "Comment jouer",
    howto_body:
      "Voyage sur la carte et r\u00e9sous un calcul \u00e0 chaque \u00e9tape. Saisis ta r\u00e9ponse avec les grandes touches et appuie sur V\u00e9rifier. Gagne des \u00e9toiles, des pi\u00e8ces et des badges. Un coffre au tr\u00e9sor t'attend \u00e0 la fin de chaque voyage !",
    play_again: "Nouveau voyage",
    paused: "Pause",
    station_progress: "\u00c9tape {n} sur {total}",
    well_done: "Bien jou\u00e9 !",
    new_badge: "Nouveau badge !",
  },
  it: {
    lang_title: "Scegli la tua lingua",
    lang_hint: "Puoi cambiarla pi\u00f9 tardi nelle impostazioni.",
    tagline: "Risolvi gli enigmi dei numeri e trova il grande tesoro!",
    btn_play: "Inizia l'avventura",
    btn_settings: "Impostazioni",
    btn_howto: "Come si gioca",
    btn_back: "Indietro",
    btn_start: "Si parte!",
    btn_check: "Controlla",
    btn_hint: "Aiuto",
    btn_resume: "Continua",
    btn_quit: "Esci",
    btn_menu: "Menu principale",
    mode_title: "Scegli il calcolo",
    m_add: "Addizioni",
    m_sub: "Sottrazioni",
    m_mul: "Moltiplicazioni",
    m_mix: "Mix colorato",
    m_add_desc: "Somma 2 o 3 numeri fino a 100.",
    m_sub_desc: "Sottrai numeri fino a 100.",
    m_mul_desc: "Le tabelline.",
    m_mix_desc: "Tutto mescolato.",
    diff_title: "Difficolt\u00e0",
    d_adaptive: "Adattiva",
    d_easy: "Facile",
    d_medium: "Media",
    d_hard: "Difficile",
    feedback_correct: "Giusto! Bravissimo!",
    feedback_wrong: "Quasi! Guarda l'aiuto.",
    lbl_stars: "Stelle",
    lbl_coins: "Monete",
    lbl_accuracy: "Precisione",
    lbl_best_streak: "Serie migliore",
    run_complete: "Viaggio completato!",
    treasure_found: "Hai trovato il tesoro!",
    set_title: "Impostazioni",
    set_sound: "Suoni",
    set_timer: "Modalit\u00e0 tempo",
    set_quick: "Giro veloce (10 compiti)",
    set_lang: "Lingua",
    set_reset: "Azzera i progressi",
    reset_confirm: "Cancellare davvero tutto?",
    howto_title: "Come si gioca",
    howto_body:
      "Viaggia sulla mappa e risolvi un calcolo a ogni stazione. Digita la risposta con i tasti grandi e premi Controlla. Raccogli stelle, monete e distintivi. Alla fine di ogni viaggio ti aspetta uno scrigno del tesoro!",
    play_again: "Nuovo viaggio",
    paused: "Pausa",
    station_progress: "Stazione {n} di {total}",
    well_done: "Ottimo lavoro!",
    new_badge: "Nuovo distintivo!",
  },
  pt: {
    lang_title: "Escolhe o teu idioma",
    lang_hint: "Podes mud\u00e1-lo mais tarde nas defini\u00e7\u00f5es.",
    tagline: "Resolve enigmas de n\u00fameros e encontra o grande tesouro!",
    btn_play: "Come\u00e7ar aventura",
    btn_settings: "Defini\u00e7\u00f5es",
    btn_howto: "Como jogar",
    btn_back: "Voltar",
    btn_start: "Vamos l\u00e1!",
    btn_check: "Verificar",
    btn_hint: "Dica",
    btn_resume: "Continuar",
    btn_quit: "Sair",
    btn_menu: "Menu principal",
    mode_title: "Escolhe o c\u00e1lculo",
    m_add: "Adi\u00e7\u00e3o",
    m_sub: "Subtra\u00e7\u00e3o",
    m_mul: "Multiplica\u00e7\u00e3o",
    m_mix: "Mistura colorida",
    m_add_desc: "Soma 2 ou 3 n\u00fameros at\u00e9 100.",
    m_sub_desc: "Subtrai n\u00fameros at\u00e9 100.",
    m_mul_desc: "A tabuada.",
    m_mix_desc: "Tudo misturado.",
    diff_title: "Dificuldade",
    d_adaptive: "Adapt\u00e1vel",
    d_easy: "F\u00e1cil",
    d_medium: "M\u00e9dia",
    d_hard: "Dif\u00edcil",
    feedback_correct: "Certo! Muito bem!",
    feedback_wrong: "Quase! Olha a dica.",
    lbl_stars: "Estrelas",
    lbl_coins: "Moedas",
    lbl_accuracy: "Acertos",
    lbl_best_streak: "Melhor sequ\u00eancia",
    run_complete: "Viagem conclu\u00edda!",
    treasure_found: "Encontraste o tesouro!",
    set_title: "Defini\u00e7\u00f5es",
    set_sound: "Sons",
    set_timer: "Modo tempo",
    set_quick: "Ronda r\u00e1pida (10 tarefas)",
    set_lang: "Idioma",
    set_reset: "Repor progresso",
    reset_confirm: "Apagar mesmo todo o progresso?",
    howto_title: "Como jogar",
    howto_body:
      "Viaja pelo mapa e resolve um c\u00e1lculo em cada esta\u00e7\u00e3o. Escreve a resposta com as teclas grandes e carrega em Verificar. Junta estrelas, moedas e emblemas. Um ba\u00fa do tesouro espera no fim de cada viagem!",
    play_again: "Nova viagem",
    paused: "Pausa",
    station_progress: "Esta\u00e7\u00e3o {n} de {total}",
    well_done: "Muito bem!",
    new_badge: "Novo emblema!",
  },
  nl: {
    lang_title: "Kies je taal",
    lang_hint: "Je kunt dit later in de instellingen wijzigen.",
    tagline: "Los rekenraadsels op en vind de grote schat!",
    btn_play: "Avontuur starten",
    btn_settings: "Instellingen",
    btn_howto: "Hoe je speelt",
    btn_back: "Terug",
    btn_start: "We gaan!",
    btn_check: "Controleren",
    btn_hint: "Tip",
    btn_resume: "Verder",
    btn_quit: "Stoppen",
    btn_menu: "Hoofdmenu",
    mode_title: "Kies je rekensom",
    m_add: "Optellen",
    m_sub: "Aftrekken",
    m_mul: "Vermenigvuldigen",
    m_mix: "Kleurrijke mix",
    m_add_desc: "Tel 2 of 3 getallen tot 100 op.",
    m_sub_desc: "Trek getallen tot 100 af.",
    m_mul_desc: "De tafels.",
    m_mix_desc: "Alles door elkaar.",
    diff_title: "Moeilijkheid",
    d_adaptive: "Meegroeiend",
    d_easy: "Makkelijk",
    d_medium: "Gemiddeld",
    d_hard: "Moeilijk",
    feedback_correct: "Goed zo! Knap gedaan!",
    feedback_wrong: "Bijna! Bekijk de tip.",
    lbl_stars: "Sterren",
    lbl_coins: "Munten",
    lbl_accuracy: "Juist",
    lbl_best_streak: "Beste reeks",
    run_complete: "Reis voltooid!",
    treasure_found: "Je hebt de schat gevonden!",
    set_title: "Instellingen",
    set_sound: "Geluiden",
    set_timer: "Tijdmodus",
    set_quick: "Snelle ronde (10 sommen)",
    set_lang: "Taal",
    set_reset: "Voortgang wissen",
    reset_confirm: "Echt alle voortgang wissen?",
    howto_title: "Hoe je speelt",
    howto_body:
      "Reis over de kaart en los bij elk station een som op. Typ je antwoord met de grote toetsen en druk op Controleren. Verzamel sterren, munten en badges. Aan het eind van elke reis wacht een schatkist!",
    play_again: "Nieuwe reis",
    paused: "Pauze",
    station_progress: "Station {n} van {total}",
    well_done: "Goed gedaan!",
    new_badge: "Nieuwe badge!",
  },
  pl: {
    lang_title: "Wybierz j\u0119zyk",
    lang_hint: "Mo\u017cesz go zmieni\u0107 p\u00f3\u017aniej w ustawieniach.",
    tagline: "Rozwi\u0105zuj zagadki liczbowe i znajd\u017a wielki skarb!",
    btn_play: "Rozpocznij przygod\u0119",
    btn_settings: "Ustawienia",
    btn_howto: "Jak gra\u0107",
    btn_back: "Wstecz",
    btn_start: "Zaczynamy!",
    btn_check: "Sprawd\u017a",
    btn_hint: "Podpowied\u017a",
    btn_resume: "Dalej",
    btn_quit: "Wyjd\u017a",
    btn_menu: "Menu g\u0142\u00f3wne",
    mode_title: "Wybierz dzia\u0142anie",
    m_add: "Dodawanie",
    m_sub: "Odejmowanie",
    m_mul: "Mno\u017cenie",
    m_mix: "Kolorowa mieszanka",
    m_add_desc: "Dodaj 2 lub 3 liczby do 100.",
    m_sub_desc: "Odejmuj liczby do 100.",
    m_mul_desc: "Tabliczka mno\u017cenia.",
    m_mix_desc: "Wszystko pomieszane.",
    diff_title: "Trudno\u015b\u0107",
    d_adaptive: "Adaptacyjna",
    d_easy: "\u0141atwa",
    d_medium: "\u015arednia",
    d_hard: "Trudna",
    feedback_correct: "Dobrze! \u015awietnie!",
    feedback_wrong: "Prawie! Spójrz na podpowied\u017a.",
    lbl_stars: "Gwiazdki",
    lbl_coins: "Monety",
    lbl_accuracy: "Trafienia",
    lbl_best_streak: "Najlepsza seria",
    run_complete: "Podr\u00f3\u017c uko\u0144czona!",
    treasure_found: "Znalaz\u0142e\u015b skarb!",
    set_title: "Ustawienia",
    set_sound: "D\u017awi\u0119ki",
    set_timer: "Tryb czasu",
    set_quick: "Szybka runda (10 zada\u0144)",
    set_lang: "J\u0119zyk",
    set_reset: "Zresetuj post\u0119py",
    reset_confirm: "Na pewno usun\u0105\u0107 ca\u0142y post\u0119p?",
    howto_title: "Jak gra\u0107",
    howto_body:
      "Podr\u00f3\u017cuj po mapie i rozwi\u0105zuj zadanie na ka\u017cdej stacji. Wpisz odpowied\u017a du\u017cymi klawiszami i naci\u015bnij Sprawd\u017a. Zbieraj gwiazdki, monety i odznaki. Na ko\u0144cu ka\u017cdej podr\u00f3\u017cy czeka skrzynia ze skarbem!",
    play_again: "Nowa podr\u00f3\u017c",
    paused: "Pauza",
    station_progress: "Stacja {n} z {total}",
    well_done: "Brawo!",
    new_badge: "Nowa odznaka!",
  },
  uk: {
    lang_title: "\u041e\u0431\u0435\u0440\u0438 \u043c\u043e\u0432\u0443",
    lang_hint:
      "\u0422\u0438 \u043c\u043e\u0436\u0435\u0448 \u0437\u043c\u0456\u043d\u0438\u0442\u0438 \u0457\u0457 \u043f\u0456\u0437\u043d\u0456\u0448\u0435 \u0432 \u043d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u043d\u044f\u0445.",
    tagline:
      "\u0420\u043e\u0437\u0432'\u044f\u0437\u0443\u0439 \u0447\u0438\u0441\u043b\u043e\u0432\u0456 \u0437\u0430\u0433\u0430\u0434\u043a\u0438 \u0442\u0430 \u0437\u043d\u0430\u0439\u0434\u0438 \u0432\u0435\u043b\u0438\u043a\u0438\u0439 \u0441\u043a\u0430\u0440\u0431!",
    btn_play:
      "\u041f\u043e\u0447\u0430\u0442\u0438 \u043f\u0440\u0438\u0433\u043e\u0434\u0443",
    btn_settings:
      "\u041d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u043d\u044f",
    btn_howto: "\u042f\u043a \u0433\u0440\u0430\u0442\u0438",
    btn_back: "\u041d\u0430\u0437\u0430\u0434",
    btn_start: "\u041f\u043e\u0457\u0445\u0430\u043b\u0438!",
    btn_check: "\u041f\u0435\u0440\u0435\u0432\u0456\u0440\u0438\u0442\u0438",
    btn_hint: "\u041f\u0456\u0434\u043a\u0430\u0437\u043a\u0430",
    btn_resume: "\u0414\u0430\u043b\u0456",
    btn_quit: "\u0412\u0438\u0439\u0442\u0438",
    btn_menu:
      "\u0413\u043e\u043b\u043e\u0432\u043d\u0435 \u043c\u0435\u043d\u044e",
    mode_title: "\u041e\u0431\u0435\u0440\u0438 \u0434\u0456\u044e",
    m_add: "\u0414\u043e\u0434\u0430\u0432\u0430\u043d\u043d\u044f",
    m_sub: "\u0412\u0456\u0434\u043d\u0456\u043c\u0430\u043d\u043d\u044f",
    m_mul: "\u041c\u043d\u043e\u0436\u0435\u043d\u043d\u044f",
    m_mix:
      "\u041a\u043e\u043b\u044c\u043e\u0440\u043e\u0432\u0430 \u0441\u0443\u043c\u0456\u0448",
    m_add_desc:
      "\u0414\u043e\u0434\u0430\u0439 2 \u0430\u0431\u043e 3 \u0447\u0438\u0441\u043b\u0430 \u0434\u043e 100.",
    m_sub_desc:
      "\u0412\u0456\u0434\u043d\u0456\u043c\u0430\u0439 \u0447\u0438\u0441\u043b\u0430 \u0434\u043e 100.",
    m_mul_desc:
      "\u0422\u0430\u0431\u043b\u0438\u0446\u044f \u043c\u043d\u043e\u0436\u0435\u043d\u043d\u044f.",
    m_mix_desc:
      "\u0423\u0441\u0435 \u043f\u0435\u0440\u0435\u043c\u0456\u0448\u0430\u043d\u043e.",
    diff_title: "\u0421\u043a\u043b\u0430\u0434\u043d\u0456\u0441\u0442\u044c",
    d_adaptive: "\u0413\u043d\u0443\u0447\u043a\u0430",
    d_easy: "\u041b\u0435\u0433\u043a\u043e",
    d_medium: "\u0421\u0435\u0440\u0435\u0434\u043d\u044c\u043e",
    d_hard: "\u0412\u0430\u0436\u043a\u043e",
    feedback_correct:
      "\u041f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e! \u0427\u0443\u0434\u043e\u0432\u043e!",
    feedback_wrong:
      "\u041c\u0430\u0439\u0436\u0435! \u041f\u043e\u0434\u0438\u0432\u0438\u0441\u044f \u043f\u0456\u0434\u043a\u0430\u0437\u043a\u0443.",
    lbl_stars: "\u0417\u0456\u0440\u043a\u0438",
    lbl_coins: "\u041c\u043e\u043d\u0435\u0442\u0438",
    lbl_accuracy: "\u0422\u043e\u0447\u043d\u0456\u0441\u0442\u044c",
    lbl_best_streak:
      "\u041d\u0430\u0439\u043a\u0440\u0430\u0449\u0430 \u0441\u0435\u0440\u0456\u044f",
    run_complete:
      "\u041f\u043e\u0434\u043e\u0440\u043e\u0436 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e!",
    treasure_found:
      "\u0422\u0438 \u0437\u043d\u0430\u0439\u0448\u043e\u0432 \u0441\u043a\u0430\u0440\u0431!",
    set_title:
      "\u041d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u043d\u044f",
    set_sound: "\u0417\u0432\u0443\u043a\u0438",
    set_timer: "\u0420\u0435\u0436\u0438\u043c \u0447\u0430\u0441\u0443",
    set_quick:
      "\u0428\u0432\u0438\u0434\u043a\u0438\u0439 \u0440\u0430\u0443\u043d\u0434 (10 \u0437\u0430\u0432\u0434\u0430\u043d\u044c)",
    set_lang: "\u041c\u043e\u0432\u0430",
    set_reset:
      "\u0421\u043a\u0438\u043d\u0443\u0442\u0438 \u043f\u0440\u043e\u0433\u0440\u0435\u0441",
    reset_confirm:
      "\u0421\u043f\u0440\u0430\u0432\u0434\u0456 \u0432\u0438\u0434\u0430\u043b\u0438\u0442\u0438 \u0432\u0435\u0441\u044c \u043f\u0440\u043e\u0433\u0440\u0435\u0441?",
    howto_title: "\u042f\u043a \u0433\u0440\u0430\u0442\u0438",
    howto_body:
      "\u041c\u0430\u043d\u0434\u0440\u0443\u0439 \u043a\u0430\u0440\u0442\u043e\u044e \u0442\u0430 \u0440\u043e\u0437\u0432'\u044f\u0437\u0443\u0439 \u0437\u0430\u0432\u0434\u0430\u043d\u043d\u044f \u043d\u0430 \u043a\u043e\u0436\u043d\u0456\u0439 \u0441\u0442\u0430\u043d\u0446\u0456\u0457. \u0412\u0432\u0435\u0434\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c \u0432\u0435\u043b\u0438\u043a\u0438\u043c\u0438 \u043a\u043d\u043e\u043f\u043a\u0430\u043c\u0438 \u0442\u0430 \u043d\u0430\u0442\u0438\u0441\u043d\u0438 \u041f\u0435\u0440\u0435\u0432\u0456\u0440\u0438\u0442\u0438. \u0417\u0431\u0438\u0440\u0430\u0439 \u0437\u0456\u0440\u043a\u0438, \u043c\u043e\u043d\u0435\u0442\u0438 \u0442\u0430 \u0432\u0456\u0434\u0437\u043d\u0430\u043a\u0438. \u041d\u0430\u043f\u0440\u0438\u043a\u0456\u043d\u0446\u0456 \u043a\u043e\u0436\u043d\u043e\u0457 \u043f\u043e\u0434\u043e\u0440\u043e\u0436\u0456 \u0447\u0435\u043a\u0430\u0454 \u0441\u043a\u0440\u0438\u043d\u044f \u0437\u0456 \u0441\u043a\u0430\u0440\u0431\u043e\u043c!",
    play_again:
      "\u041d\u043e\u0432\u0430 \u043f\u043e\u0434\u043e\u0440\u043e\u0436",
    paused: "\u041f\u0430\u0443\u0437\u0430",
    station_progress:
      "\u0421\u0442\u0430\u043d\u0446\u0456\u044f {n} \u0437 {total}",
    well_done: "\u0427\u0443\u0434\u043e\u0432\u043e!",
    new_badge:
      "\u041d\u043e\u0432\u0430 \u0432\u0456\u0434\u0437\u043d\u0430\u043a\u0430!",
  },
  ru: {
    lang_title: "\u0412\u044b\u0431\u0435\u0440\u0438 \u044f\u0437\u044b\u043a",
    lang_hint:
      "\u0415\u0433\u043e \u043c\u043e\u0436\u043d\u043e \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u043e\u0437\u0436\u0435 \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445.",
    tagline:
      "\u0420\u0435\u0448\u0430\u0439 \u0447\u0438\u0441\u043b\u043e\u0432\u044b\u0435 \u0433\u043e\u043b\u043e\u0432\u043e\u043b\u043e\u043c\u043a\u0438 \u0438 \u043d\u0430\u0439\u0434\u0438 \u0431\u043e\u043b\u044c\u0448\u043e\u0439 \u043a\u043b\u0430\u0434!",
    btn_play:
      "\u041d\u0430\u0447\u0430\u0442\u044c \u043f\u0440\u0438\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435",
    btn_settings: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
    btn_howto: "\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c",
    btn_back: "\u041d\u0430\u0437\u0430\u0434",
    btn_start: "\u041f\u043e\u0435\u0445\u0430\u043b\u0438!",
    btn_check: "\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c",
    btn_hint: "\u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430",
    btn_resume: "\u0414\u0430\u043b\u0435\u0435",
    btn_quit: "\u0412\u044b\u0439\u0442\u0438",
    btn_menu:
      "\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e",
    mode_title:
      "\u0412\u044b\u0431\u0435\u0440\u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
    m_add: "\u0421\u043b\u043e\u0436\u0435\u043d\u0438\u0435",
    m_sub: "\u0412\u044b\u0447\u0438\u0442\u0430\u043d\u0438\u0435",
    m_mul: "\u0423\u043c\u043d\u043e\u0436\u0435\u043d\u0438\u0435",
    m_mix:
      "\u0426\u0432\u0435\u0442\u043d\u043e\u0439 \u043c\u0438\u043a\u0441",
    m_add_desc:
      "\u0421\u043b\u043e\u0436\u0438 2 \u0438\u043b\u0438 3 \u0447\u0438\u0441\u043b\u0430 \u0434\u043e 100.",
    m_sub_desc:
      "\u0412\u044b\u0447\u0438\u0442\u0430\u0439 \u0447\u0438\u0441\u043b\u0430 \u0434\u043e 100.",
    m_mul_desc:
      "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0443\u043c\u043d\u043e\u0436\u0435\u043d\u0438\u044f.",
    m_mix_desc:
      "\u0412\u0441\u0451 \u0432\u043f\u0435\u0440\u0435\u043c\u0435\u0448\u043a\u0443.",
    diff_title: "\u0421\u043b\u043e\u0436\u043d\u043e\u0441\u0442\u044c",
    d_adaptive: "\u0413\u0438\u0431\u043a\u0430\u044f",
    d_easy: "\u041b\u0435\u0433\u043a\u043e",
    d_medium: "\u0421\u0440\u0435\u0434\u043d\u0435",
    d_hard: "\u0421\u043b\u043e\u0436\u043d\u043e",
    feedback_correct:
      "\u0412\u0435\u0440\u043d\u043e! \u041e\u0442\u043b\u0438\u0447\u043d\u043e!",
    feedback_wrong:
      "\u041f\u043e\u0447\u0442\u0438! \u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0438 \u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0443.",
    lbl_stars: "\u0417\u0432\u0451\u0437\u0434\u044b",
    lbl_coins: "\u041c\u043e\u043d\u0435\u0442\u044b",
    lbl_accuracy: "\u0422\u043e\u0447\u043d\u043e\u0441\u0442\u044c",
    lbl_best_streak:
      "\u041b\u0443\u0447\u0448\u0430\u044f \u0441\u0435\u0440\u0438\u044f",
    run_complete:
      "\u041f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e!",
    treasure_found:
      "\u0422\u044b \u043d\u0430\u0448\u0451\u043b \u043a\u043b\u0430\u0434!",
    set_title: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
    set_sound: "\u0417\u0432\u0443\u043a\u0438",
    set_timer:
      "\u0420\u0435\u0436\u0438\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438",
    set_quick:
      "\u0411\u044b\u0441\u0442\u0440\u044b\u0439 \u0440\u0430\u0443\u043d\u0434 (10 \u0437\u0430\u0434\u0430\u043d\u0438\u0439)",
    set_lang: "\u042f\u0437\u044b\u043a",
    set_reset:
      "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441",
    reset_confirm:
      "\u0422\u043e\u0447\u043d\u043e \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0432\u0435\u0441\u044c \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441?",
    howto_title: "\u041a\u0430\u043a \u0438\u0433\u0440\u0430\u0442\u044c",
    howto_body:
      "\u041f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0443\u0439 \u043f\u043e \u043a\u0430\u0440\u0442\u0435 \u0438 \u0440\u0435\u0448\u0430\u0439 \u0437\u0430\u0434\u0430\u0447\u0443 \u043d\u0430 \u043a\u0430\u0436\u0434\u043e\u0439 \u0441\u0442\u0430\u043d\u0446\u0438\u0438. \u0412\u0432\u043e\u0434\u0438 \u043e\u0442\u0432\u0435\u0442 \u0431\u043e\u043b\u044c\u0448\u0438\u043c\u0438 \u043a\u043d\u043e\u043f\u043a\u0430\u043c\u0438 \u0438 \u043d\u0430\u0436\u0438\u043c\u0430\u0439 \u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c. \u0421\u043e\u0431\u0438\u0440\u0430\u0439 \u0437\u0432\u0451\u0437\u0434\u044b, \u043c\u043e\u043d\u0435\u0442\u044b \u0438 \u0437\u043d\u0430\u0447\u043a\u0438. \u0412 \u043a\u043e\u043d\u0446\u0435 \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u043f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u044f \u0436\u0434\u0451\u0442 \u0441\u0443\u043d\u0434\u0443\u043a \u0441 \u0441\u043e\u043a\u0440\u043e\u0432\u0438\u0449\u0430\u043c\u0438!",
    play_again:
      "\u041d\u043e\u0432\u043e\u0435 \u043f\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435",
    paused: "\u041f\u0430\u0443\u0437\u0430",
    station_progress:
      "\u0421\u0442\u0430\u043d\u0446\u0438\u044f {n} \u0438\u0437 {total}",
    well_done: "\u041c\u043e\u043b\u043e\u0434\u0435\u0446!",
    new_badge:
      "\u041d\u043e\u0432\u044b\u0439 \u0437\u043d\u0430\u0447\u043e\u043a!",
  },
  tr: {
    lang_title: "Dilini se\u00e7",
    lang_hint: "Daha sonra ayarlardan de\u011fi\u015ftirebilirsin.",
    tagline:
      "Say\u0131 bulmacalar\u0131n\u0131 \u00e7\u00f6z ve b\u00fcy\u00fck hazineyi bul!",
    btn_play: "Maceraya ba\u015fla",
    btn_settings: "Ayarlar",
    btn_howto: "Nas\u0131l oynan\u0131r",
    btn_back: "Geri",
    btn_start: "Hadi ba\u015flayal\u0131m!",
    btn_check: "Kontrol et",
    btn_hint: "\u0130pucu",
    btn_resume: "Devam",
    btn_quit: "\u00c7\u0131k",
    btn_menu: "Ana men\u00fc",
    mode_title: "\u0130\u015flemini se\u00e7",
    m_add: "Toplama",
    m_sub: "\u00c7\u0131karma",
    m_mul: "\u00c7arpma",
    m_mix: "Renkli kar\u0131\u015f\u0131m",
    m_add_desc: "100'e kadar 2 veya 3 say\u0131 topla.",
    m_sub_desc: "100'e kadar say\u0131 \u00e7\u0131kar.",
    m_mul_desc: "\u00c7arp\u0131m tablosu.",
    m_mix_desc: "Hepsi kar\u0131\u015f\u0131k.",
    diff_title: "Zorluk",
    d_adaptive: "Uyarlanabilir",
    d_easy: "Kolay",
    d_medium: "Orta",
    d_hard: "Zor",
    feedback_correct: "Do\u011fru! Harika!",
    feedback_wrong: "Az kald\u0131! \u0130pucuna bak.",
    lbl_stars: "Y\u0131ld\u0131zlar",
    lbl_coins: "Para",
    lbl_accuracy: "\u0130sabet",
    lbl_best_streak: "En iyi seri",
    run_complete: "Yolculuk tamam!",
    treasure_found: "Hazineyi buldun!",
    set_title: "Ayarlar",
    set_sound: "Sesler",
    set_timer: "S\u00fcre modu",
    set_quick: "H\u0131zl\u0131 tur (10 g\u00f6rev)",
    set_lang: "Dil",
    set_reset: "\u0130lerlemeyi s\u0131f\u0131rla",
    reset_confirm: "T\u00fcm ilerleme silinsin mi?",
    howto_title: "Nas\u0131l oynan\u0131r",
    howto_body:
      "Haritada yolculuk yap ve her durakta bir i\u015flem \u00e7\u00f6z. Cevab\u0131n\u0131 b\u00fcy\u00fck tu\u015flarla yaz ve Kontrol et'e bas. Y\u0131ld\u0131z, para ve rozet topla. Her yolculu\u011fun sonunda bir hazine sand\u0131\u011f\u0131 seni bekliyor!",
    play_again: "Yeni yolculuk",
    paused: "Duraklat\u0131ld\u0131",
    station_progress: "Durak {n} / {total}",
    well_done: "Aferin!",
    new_badge: "Yeni rozet!",
  },
  ar: {
    lang_title: "\u0627\u062e\u062a\u0631 \u0644\u063a\u062a\u0643",
    lang_hint:
      "\u064a\u0645\u0643\u0646\u0643 \u062a\u063a\u064a\u064a\u0631\u0647\u0627 \u0644\u0627\u062d\u0642\u064b\u0627 \u0645\u0646 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a.",
    tagline:
      "\u062d\u0644 \u0623\u0644\u063a\u0627\u0632 \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0648\u0627\u0639\u062b\u0631 \u0639\u0644\u0649 \u0627\u0644\u0643\u0646\u0632 \u0627\u0644\u0643\u0628\u064a\u0631!",
    btn_play:
      "\u0627\u0628\u062f\u0623 \u0627\u0644\u0645\u063a\u0627\u0645\u0631\u0629",
    btn_settings: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    btn_howto: "\u0643\u064a\u0641 \u062a\u0644\u0639\u0628",
    btn_back: "\u0631\u062c\u0648\u0639",
    btn_start: "\u0647\u064a\u0627 \u0628\u0646\u0627!",
    btn_check: "\u062a\u062d\u0642\u0642",
    btn_hint: "\u062a\u0644\u0645\u064a\u062d",
    btn_resume: "\u0645\u062a\u0627\u0628\u0639\u0629",
    btn_quit: "\u062e\u0631\u0648\u062c",
    btn_menu:
      "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",
    mode_title: "\u0627\u062e\u062a\u0631 \u0639\u0645\u0644\u064a\u062a\u0643",
    m_add: "\u0627\u0644\u062c\u0645\u0639",
    m_sub: "\u0627\u0644\u0637\u0631\u062d",
    m_mul: "\u0627\u0644\u0636\u0631\u0628",
    m_mix: "\u0645\u0632\u064a\u062c \u0645\u0644\u0648\u0646",
    m_add_desc:
      "\u0627\u062c\u0645\u0639 \u0631\u0642\u0645\u064a\u0646 \u0623\u0648 \u062b\u0644\u0627\u062b\u0629 \u062d\u062a\u0649 100.",
    m_sub_desc:
      "\u0627\u0637\u0631\u062d \u0623\u0631\u0642\u0627\u0645\u064b\u0627 \u062d\u062a\u0649 100.",
    m_mul_desc: "\u062c\u062f\u0648\u0644 \u0627\u0644\u0636\u0631\u0628.",
    m_mix_desc:
      "\u0643\u0644 \u0634\u064a\u0621 \u0645\u062e\u062a\u0644\u0637.",
    diff_title: "\u0627\u0644\u0635\u0639\u0648\u0628\u0629",
    d_adaptive: "\u0645\u062a\u0643\u064a\u0641\u0629",
    d_easy: "\u0633\u0647\u0644",
    d_medium: "\u0645\u062a\u0648\u0633\u0637",
    d_hard: "\u0635\u0639\u0628",
    feedback_correct:
      "\u0635\u062d\u064a\u062d! \u0623\u062d\u0633\u0646\u062a!",
    feedback_wrong:
      "\u0627\u0642\u062a\u0631\u0628\u062a! \u0627\u0646\u0638\u0631 \u0625\u0644\u0649 \u0627\u0644\u062a\u0644\u0645\u064a\u062d.",
    lbl_stars: "\u0646\u062c\u0648\u0645",
    lbl_coins: "\u0639\u0645\u0644\u0627\u062a",
    lbl_accuracy: "\u0627\u0644\u062f\u0642\u0629",
    lbl_best_streak: "\u0623\u0641\u0636\u0644 \u0633\u0644\u0633\u0644\u0629",
    run_complete:
      "\u0627\u0643\u062a\u0645\u0644\u062a \u0627\u0644\u0631\u062d\u0644\u0629!",
    treasure_found:
      "\u0644\u0642\u062f \u0648\u062c\u062f\u062a \u0627\u0644\u0643\u0646\u0632!",
    set_title: "\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a",
    set_sound: "\u0627\u0644\u0623\u0635\u0648\u0627\u062a",
    set_timer: "\u0648\u0636\u0639 \u0627\u0644\u0648\u0642\u062a",
    set_quick:
      "\u062c\u0648\u0644\u0629 \u0633\u0631\u064a\u0639\u0629 (10 \u0645\u0647\u0627\u0645)",
    set_lang: "\u0627\u0644\u0644\u063a\u0629",
    set_reset:
      "\u0625\u0639\u0627\u062f\u0629 \u0636\u0628\u0637 \u0627\u0644\u062a\u0642\u062f\u0645",
    reset_confirm:
      "\u0647\u0644 \u062a\u0631\u064a\u062f \u062d\u0642\u064b\u0627 \u062d\u0630\u0641 \u0643\u0644 \u0627\u0644\u062a\u0642\u062f\u0645\u061f",
    howto_title: "\u0643\u064a\u0641 \u062a\u0644\u0639\u0628",
    howto_body:
      "\u0633\u0627\u0641\u0631 \u0639\u0628\u0631 \u0627\u0644\u062e\u0631\u064a\u0637\u0629 \u0648\u062d\u0644 \u0645\u0633\u0623\u0644\u0629 \u0639\u0646\u062f \u0643\u0644 \u0645\u062d\u0637\u0629. \u0627\u0643\u062a\u0628 \u0625\u062c\u0627\u0628\u062a\u0643 \u0628\u0627\u0644\u0623\u0632\u0631\u0627\u0631 \u0627\u0644\u0643\u0628\u064a\u0631\u0629 \u062b\u0645 \u0627\u0636\u063a\u0637 \u062a\u062d\u0642\u0642. \u0627\u062c\u0645\u0639 \u0627\u0644\u0646\u062c\u0648\u0645 \u0648\u0627\u0644\u0639\u0645\u0644\u0627\u062a \u0648\u0627\u0644\u0623\u0648\u0633\u0645\u0629. \u0641\u064a \u0646\u0647\u0627\u064a\u0629 \u0643\u0644 \u0631\u062d\u0644\u0629 \u064a\u0646\u062a\u0638\u0631\u0643 \u0635\u0646\u062f\u0648\u0642 \u0643\u0646\u0632!",
    play_again: "\u0631\u062d\u0644\u0629 \u062c\u062f\u064a\u062f\u0629",
    paused: "\u0625\u064a\u0642\u0627\u0641 \u0645\u0624\u0642\u062a",
    station_progress:
      "\u0627\u0644\u0645\u062d\u0637\u0629 {n} \u0645\u0646 {total}",
    well_done: "\u0639\u0645\u0644 \u0631\u0627\u0626\u0639!",
    new_badge: "\u0648\u0633\u0627\u0645 \u062c\u062f\u064a\u062f!",
  },
  hi: {
    lang_title:
      "\u0905\u092a\u0928\u0940 \u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902",
    lang_hint:
      "\u0906\u092a \u0907\u0938\u0947 \u092c\u093e\u0926 \u092e\u0947\u0902 \u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938 \u092e\u0947\u0902 \u092c\u0926\u0932 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964",
    tagline:
      "\u0938\u0902\u0916\u094d\u092f\u093e \u092a\u0939\u0947\u0932\u093f\u092f\u093e\u0901 \u0939\u0932 \u0915\u0930\u0947\u0902 \u0914\u0930 \u092c\u0921\u093c\u093e \u0916\u091c\u093c\u093e\u0928\u093e \u092a\u093e\u090f\u0902!",
    btn_play:
      "\u0938\u093e\u0939\u0938 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    btn_settings: "\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938",
    btn_howto: "\u0915\u0948\u0938\u0947 \u0916\u0947\u0932\u0947\u0902",
    btn_back: "\u092a\u0940\u091b\u0947",
    btn_start: "\u091a\u0932\u0947\u0902!",
    btn_check: "\u091c\u093e\u0901\u091a\u0947\u0902",
    btn_hint: "\u0938\u0902\u0915\u0947\u0924",
    btn_resume: "\u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902",
    btn_quit: "\u092c\u093e\u0939\u0930",
    btn_menu: "\u092e\u0941\u0916\u094d\u092f \u092e\u0947\u0928\u0942",
    mode_title:
      "\u0905\u092a\u0928\u0940 \u0917\u0923\u0928\u093e \u091a\u0941\u0928\u0947\u0902",
    m_add: "\u091c\u094b\u0921\u093c",
    m_sub: "\u0918\u091f\u093e\u0935",
    m_mul: "\u0917\u0941\u0923\u093e",
    m_mix:
      "\u0930\u0902\u0917\u0940\u0928 \u092e\u093f\u0936\u094d\u0930\u0923",
    m_add_desc:
      "100 \u0924\u0915 2 \u092f\u093e 3 \u0938\u0902\u0916\u094d\u092f\u093e\u090f\u0901 \u091c\u094b\u0921\u093c\u0947\u0902\u0964",
    m_sub_desc:
      "100 \u0924\u0915 \u0938\u0902\u0916\u094d\u092f\u093e\u090f\u0901 \u0918\u091f\u093e\u090f\u0902\u0964",
    m_mul_desc: "\u092a\u0939\u093e\u0921\u093c\u0947\u0964",
    m_mix_desc:
      "\u0938\u092c \u092e\u093f\u0932\u093e-\u091c\u0941\u0932\u093e\u0964",
    diff_title: "\u0915\u0920\u093f\u0928\u093e\u0908",
    d_adaptive: "\u0905\u0928\u0941\u0915\u0942\u0932",
    d_easy: "\u0906\u0938\u093e\u0928",
    d_medium: "\u092e\u0927\u094d\u092f\u092e",
    d_hard: "\u0915\u0920\u093f\u0928",
    feedback_correct: "\u0938\u0939\u0940! \u0936\u093e\u092c\u093e\u0936!",
    feedback_wrong:
      "\u0932\u0917\u092d\u0917! \u0938\u0902\u0915\u0947\u0924 \u0926\u0947\u0916\u0947\u0902\u0964",
    lbl_stars: "\u0938\u093f\u0924\u093e\u0930\u0947",
    lbl_coins: "\u0938\u093f\u0915\u094d\u0915\u0947",
    lbl_accuracy: "\u0938\u091f\u0940\u0915\u0924\u093e",
    lbl_best_streak:
      "\u0938\u0930\u094d\u0935\u0936\u094d\u0930\u0947\u0937\u094d\u0920 \u0936\u094d\u0930\u0943\u0902\u0916\u0932\u093e",
    run_complete:
      "\u092f\u093e\u0924\u094d\u0930\u093e \u092a\u0942\u0930\u0940!",
    treasure_found:
      "\u0906\u092a\u0915\u094b \u0916\u091c\u093c\u093e\u0928\u093e \u092e\u093f\u0932 \u0917\u092f\u093e!",
    set_title: "\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938",
    set_sound: "\u0927\u094d\u0935\u0928\u093f",
    set_timer: "\u091f\u093e\u0907\u092e\u0930 \u092e\u094b\u0921",
    set_quick:
      "\u0924\u0947\u091c\u093c \u0926\u094c\u0930 (10 \u0915\u093e\u0930\u094d\u092f)",
    set_lang: "\u092d\u093e\u0937\u093e",
    set_reset:
      "\u092a\u094d\u0930\u0917\u0924\u093f \u0930\u0940\u0938\u0947\u091f \u0915\u0930\u0947\u0902",
    reset_confirm:
      "\u0915\u094d\u092f\u093e \u0938\u091a\u092e\u0941\u091a \u0938\u092d\u0940 \u092a\u094d\u0930\u0917\u0924\u093f \u092e\u093f\u091f\u093e\u090f\u0902?",
    howto_title: "\u0915\u0948\u0938\u0947 \u0916\u0947\u0932\u0947\u0902",
    howto_body:
      "\u0928\u0915\u094d\u0936\u0947 \u092a\u0930 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0930\u0947\u0902 \u0914\u0930 \u0939\u0930 \u0938\u094d\u091f\u0947\u0936\u0928 \u092a\u0930 \u090f\u0915 \u0938\u0935\u093e\u0932 \u0939\u0932 \u0915\u0930\u0947\u0902\u0964 \u092c\u0921\u093c\u0947 \u092c\u091f\u0928\u094b\u0902 \u0938\u0947 \u0905\u092a\u0928\u093e \u0909\u0924\u094d\u0924\u0930 \u0932\u093f\u0916\u0947\u0902 \u0914\u0930 \u091c\u093e\u0901\u091a\u0947\u0902 \u0926\u092c\u093e\u090f\u0902\u0964 \u0938\u093f\u0924\u093e\u0930\u0947, \u0938\u093f\u0915\u094d\u0915\u0947 \u0914\u0930 \u092c\u0948\u091c \u091c\u092e\u093e \u0915\u0930\u0947\u0902\u0964 \u0939\u0930 \u092f\u093e\u0924\u094d\u0930\u093e \u0915\u0947 \u0905\u0902\u0924 \u092e\u0947\u0902 \u090f\u0915 \u0916\u091c\u093c\u093e\u0928\u093e \u0938\u0902\u0926\u0942\u0915 \u0907\u0902\u0924\u091c\u093c\u093e\u0930 \u0915\u0930\u0924\u0940 \u0939\u0948!",
    play_again: "\u0928\u0908 \u092f\u093e\u0924\u094d\u0930\u093e",
    paused: "\u0930\u0941\u0915\u093e",
    station_progress: "\u0938\u094d\u091f\u0947\u0936\u0928 {n} / {total}",
    well_done: "\u0936\u093e\u092c\u093e\u0936!",
    new_badge: "\u0928\u092f\u093e \u092c\u0948\u091c!",
  },
  zh: {
    lang_title: "\u9009\u62e9\u4f60\u7684\u8bed\u8a00",
    lang_hint:
      "\u4f60\u53ef\u4ee5\u7a0d\u540e\u5728\u8bbe\u7f6e\u4e2d\u66f4\u6539\u3002",
    tagline:
      "\u89e3\u5f00\u6570\u5b57\u8c1c\u9898\uff0c\u627e\u5230\u5927\u5b9d\u85cf\uff01",
    btn_play: "\u5f00\u59cb\u5192\u9669",
    btn_settings: "\u8bbe\u7f6e",
    btn_howto: "\u5982\u4f55\u6e38\u73a9",
    btn_back: "\u8fd4\u56de",
    btn_start: "\u51fa\u53d1\uff01",
    btn_check: "\u68c0\u67e5",
    btn_hint: "\u63d0\u793a",
    btn_resume: "\u7ee7\u7eed",
    btn_quit: "\u9000\u51fa",
    btn_menu: "\u4e3b\u83dc\u5355",
    mode_title: "\u9009\u62e9\u8fd0\u7b97",
    m_add: "\u52a0\u6cd5",
    m_sub: "\u51cf\u6cd5",
    m_mul: "\u4e58\u6cd5",
    m_mix: "\u7f24\u7eb7\u6df7\u5408",
    m_add_desc:
      "\u5c06 2 \u6216 3 \u4e2a\u6570\u76f8\u52a0\uff0c\u4e0d\u8d85\u8fc7 100\u3002",
    m_sub_desc: "\u51cf\u53bb\u4e0d\u8d85\u8fc7 100 \u7684\u6570\u3002",
    m_mul_desc: "\u4e5d\u4e5d\u4e58\u6cd5\u8868\u3002",
    m_mix_desc: "\u5168\u90e8\u6df7\u5728\u4e00\u8d77\u3002",
    diff_title: "\u96be\u5ea6",
    d_adaptive: "\u81ea\u9002\u5e94",
    d_easy: "\u7b80\u5355",
    d_medium: "\u4e2d\u7b49",
    d_hard: "\u56f0\u96be",
    feedback_correct: "\u6b63\u786e\uff01\u592a\u68d2\u4e86\uff01",
    feedback_wrong: "\u5dee\u4e00\u70b9\uff01\u770b\u770b\u63d0\u793a\u3002",
    lbl_stars: "\u661f\u661f",
    lbl_coins: "\u91d1\u5e01",
    lbl_accuracy: "\u6b63\u786e\u7387",
    lbl_best_streak: "\u6700\u4f73\u8fde\u51fb",
    run_complete: "\u65c5\u7a0b\u5b8c\u6210\uff01",
    treasure_found: "\u4f60\u627e\u5230\u4e86\u5b9d\u85cf\uff01",
    set_title: "\u8bbe\u7f6e",
    set_sound: "\u58f0\u97f3",
    set_timer: "\u8ba1\u65f6\u6a21\u5f0f",
    set_quick: "\u5feb\u901f\u6a21\u5f0f\uff0810 \u9898\uff09",
    set_lang: "\u8bed\u8a00",
    set_reset: "\u91cd\u7f6e\u8fdb\u5ea6",
    reset_confirm:
      "\u786e\u5b9a\u5220\u9664\u6240\u6709\u8fdb\u5ea6\u5417\uff1f",
    howto_title: "\u5982\u4f55\u6e38\u73a9",
    howto_body:
      "\u5728\u5730\u56fe\u4e0a\u65c5\u884c\uff0c\u5728\u6bcf\u4e2a\u7ad9\u70b9\u89e3\u4e00\u9053\u9898\u3002\u7528\u5927\u6309\u952e\u8f93\u5165\u7b54\u6848\uff0c\u7136\u540e\u70b9\u51fb\u68c0\u67e5\u3002\u6536\u96c6\u661f\u661f\u3001\u91d1\u5e01\u548c\u5fbd\u7ae0\u3002\u6bcf\u6b21\u65c5\u7a0b\u7ed3\u675f\u65f6\u90fd\u6709\u4e00\u4e2a\u5b9d\u7bb1\u5728\u7b49\u4f60\uff01",
    play_again: "\u65b0\u65c5\u7a0b",
    paused: "\u6682\u505c",
    station_progress: "\u7b2c {n} / {total} \u7ad9",
    well_done: "\u505a\u5f97\u597d\uff01",
    new_badge: "\u65b0\u5fbd\u7ae0\uff01",
  },
  ja: {
    lang_title: "\u8a00\u8a9e\u3092\u9078\u3093\u3067\u306d",
    lang_hint:
      "\u3042\u3068\u3067\u8a2d\u5b9a\u304b\u3089\u5909\u66f4\u3067\u304d\u307e\u3059\u3002",
    tagline:
      "\u6570\u306e\u30d1\u30ba\u30eb\u3092\u89e3\u3044\u3066\u3001\u5927\u304d\u306a\u5b9d\u3092\u898b\u3064\u3051\u3088\u3046\uff01",
    btn_play: "\u5192\u967a\u3092\u59cb\u3081\u308b",
    btn_settings: "\u8a2d\u5b9a",
    btn_howto: "\u3042\u305d\u3073\u65b9",
    btn_back: "\u623b\u308b",
    btn_start: "\u3055\u3042\u884c\u3053\u3046\uff01",
    btn_check: "\u30c1\u30a7\u30c3\u30af",
    btn_hint: "\u30d2\u30f3\u30c8",
    btn_resume: "\u3064\u3065\u3051\u308b",
    btn_quit: "\u3084\u3081\u308b",
    btn_menu: "\u30e1\u30a4\u30f3\u30e1\u30cb\u30e5\u30fc",
    mode_title: "\u8a08\u7b97\u3092\u9078\u3093\u3067\u306d",
    m_add: "\u305f\u3057\u7b97",
    m_sub: "\u3072\u304d\u7b97",
    m_mul: "\u304b\u3051\u7b97",
    m_mix: "\u30ab\u30e9\u30d5\u30eb\u30df\u30c3\u30af\u30b9",
    m_add_desc:
      "100 \u307e\u3067\u306e 2\u30013 \u3064\u306e\u6570\u3092\u305f\u3059\u3002",
    m_sub_desc: "100 \u307e\u3067\u306e\u6570\u3092\u3072\u304f\u3002",
    m_mul_desc: "\u304b\u3051\u7b97\u306e\u4e5d\u4e5d\u3002",
    m_mix_desc: "\u5168\u90e8\u307e\u305c\u3066\u3002",
    diff_title: "\u3080\u305a\u304b\u3057\u3055",
    d_adaptive: "\u9069\u5fdc",
    d_easy: "\u3084\u3055\u3057\u3044",
    d_medium: "\u3075\u3064\u3046",
    d_hard: "\u3080\u305a\u304b\u3057\u3044",
    feedback_correct:
      "\u6b63\u89e3\uff01\u3088\u304f\u3067\u304d\u307e\u3057\u305f\uff01",
    feedback_wrong:
      "\u3082\u3046\u5c11\u3057\uff01\u30d2\u30f3\u30c8\u3092\u898b\u3066\u306d\u3002",
    lbl_stars: "\u30b9\u30bf\u30fc",
    lbl_coins: "\u30b3\u30a4\u30f3",
    lbl_accuracy: "\u6b63\u89e3\u7387",
    lbl_best_streak: "\u6700\u9ad8\u9023\u7d9a",
    run_complete: "\u65c5\u304c\u5b8c\u4e86\uff01",
    treasure_found: "\u5b9d\u3092\u898b\u3064\u3051\u305f\uff01",
    set_title: "\u8a2d\u5b9a",
    set_sound: "\u30b5\u30a6\u30f3\u30c9",
    set_timer: "\u30bf\u30a4\u30de\u30fc\u30e2\u30fc\u30c9",
    set_quick: "\u30af\u30a4\u30c3\u30af\uff0810\u554f\uff09",
    set_lang: "\u8a00\u8a9e",
    set_reset: "\u9032\u6357\u3092\u30ea\u30bb\u30c3\u30c8",
    reset_confirm:
      "\u672c\u5f53\u306b\u3059\u3079\u3066\u306e\u9032\u6357\u3092\u6d88\u3057\u307e\u3059\u304b\uff1f",
    howto_title: "\u3042\u305d\u3073\u65b9",
    howto_body:
      "\u5730\u56f3\u3092\u65c5\u3057\u3066\u3001\u5404\u99c5\u3067\u8a08\u7b97\u3092\u89e3\u304d\u307e\u3057\u3087\u3046\u3002\u5927\u304d\u306a\u30dc\u30bf\u30f3\u3067\u7b54\u3048\u3092\u5165\u529b\u3057\u3066\u30c1\u30a7\u30c3\u30af\u3092\u62bc\u3057\u307e\u3059\u3002\u30b9\u30bf\u30fc\u3001\u30b3\u30a4\u30f3\u3001\u30d0\u30c3\u30b8\u3092\u96c6\u3081\u3088\u3046\u3002\u65c5\u306e\u6700\u5f8c\u306b\u306f\u5b9d\u7bb1\u304c\u5f85\u3063\u3066\u3044\u307e\u3059\uff01",
    play_again: "\u65b0\u3057\u3044\u65c5",
    paused: "\u4e00\u6642\u505c\u6b62",
    station_progress: "\u99c5 {n} / {total}",
    well_done: "\u3088\u304f\u3067\u304d\u307e\u3057\u305f\uff01",
    new_badge: "\u65b0\u3057\u3044\u30d0\u30c3\u30b8\uff01",
  },
  ko: {
    lang_title: "\uc5b8\uc5b4\ub97c \uc120\ud0dd\ud558\uc138\uc694",
    lang_hint:
      "\ub098\uc911\uc5d0 \uc124\uc815\uc5d0\uc11c \ubcc0\uacbd\ud560 \uc218 \uc788\uc5b4\uc694.",
    tagline:
      "\uc22b\uc790 \ud37c\uc990\uc744 \ud480\uace0 \ud070 \ubcf4\ubb3c\uc744 \ucc3e\uc544\uc694!",
    btn_play: "\ubaa8\ud5d8 \uc2dc\uc791",
    btn_settings: "\uc124\uc815",
    btn_howto: "\uac8c\uc784 \ubc29\ubc95",
    btn_back: "\ub4a4\ub85c",
    btn_start: "\ucd9c\ubc1c!",
    btn_check: "\ud655\uc778",
    btn_hint: "\ud78c\ud2b8",
    btn_resume: "\uacc4\uc18d",
    btn_quit: "\ub098\uac00\uae30",
    btn_menu: "\uba54\uc778 \uba54\ub274",
    mode_title: "\uacc4\uc0b0\uc744 \uc120\ud0dd\ud558\uc138\uc694",
    m_add: "\ub367\uc148",
    m_sub: "\ube84\uc148",
    m_mul: "\uacf1\uc148",
    m_mix: "\ucef4\ub7ec\ǔ \ubbf9\uc2a4",
    m_add_desc:
      "100\uae4c\uc9c0 2\uac1c \ub610\ub294 3\uac1c\ub97c \ub354\ud574\uc694.",
    m_sub_desc: "100\uae4c\uc9c0 \uc218\ub97c \ube7c\uc694.",
    m_mul_desc: "\uad6c\uad6c\ub2e8.",
    m_mix_desc: "\ubaa8\ub450 \uc11e\uc5ec\uc694.",
    diff_title: "\ub09c\uc774\ub3c4",
    d_adaptive: "\uc801\uc751\ud615",
    d_easy: "\uc26c\uc6c0",
    d_medium: "\ubcf4\ud1b5",
    d_hard: "\uc5b4\ub824\uc6c0",
    feedback_correct: "\uc815\ub2f5! \uc798\ud588\uc5b4\uc694!",
    feedback_wrong:
      "\uc544\uae5d\uc6c0! \ud78c\ud2b8\ub97c \ubcf4\uc138\uc694.",
    lbl_stars: "\ubcc4",
    lbl_coins: "\ucf54\uc778",
    lbl_accuracy: "\uc815\ud655\ub3c4",
    lbl_best_streak: "\ucd5c\uace0 \uc5f0\uc18d",
    run_complete: "\uc5ec\ud589 \uc644\ub8cc!",
    treasure_found: "\ubcf4\ubb3c\uc744 \ucc3e\uc558\uc5b4\uc694!",
    set_title: "\uc124\uc815",
    set_sound: "\uc18c\ub9ac",
    set_timer: "\ud0c0\uc774\uba38 \ubaa8\ub4dc",
    set_quick: "\ube60\ub978 \ub77c\uc6b4\ub4dc (10\ubb38\uc81c)",
    set_lang: "\uc5b8\uc5b4",
    set_reset: "\uc9c4\ud589 \ucd08\uae30\ud654",
    reset_confirm:
      "\uc815\ub9d0 \ubaa8\ub4e0 \uc9c4\ud589\uc744 \uc0ad\uc81c\ud560\uae4c\uc694?",
    howto_title: "\uac8c\uc784 \ubc29\ubc95",
    howto_body:
      "\uc9c0\ub3c4\ub97c \uc5ec\ud589\ud558\uba74\uc11c \uac01 \uc5ed\uc5d0\uc11c \ubb38\uc81c\ub97c \ud480\uc5b4\uc694. \ud070 \ubc84\ud2bc\uc73c\ub85c \ub2f5\uc744 \uc785\ub825\ud558\uace0 \ud655\uc778\uc744 \ub20c\ub7ec\uc694. \ubcc4, \ucf54\uc778, \ubc30\uc9c0\ub97c \ubaa8\uc544\uc694. \uc5ec\ud589 \ub05d\ub9c8\ub2e4 \ubcf4\ubb3c \uc0c1\uc790\uac00 \uae30\ub2e4\ub824\uc694!",
    play_again: "\uc0c8 \uc5ec\ud589",
    paused: "\uc77c\uc2dc\uc815\uc9c0",
    station_progress: "\uc5ed {n} / {total}",
    well_done: "\uc798\ud588\uc5b4\uc694!",
    new_badge: "\uc0c8 \ubc30\uc9c0!",
  },
};

// Badge labels are intentionally kept in German + English only; other
// languages fall back to German per the documented fallback rule.
var BADGE_LABELS = {
  first_treasure: {
    de: "Erster Schatz",
    en: "First treasure",
    icon: "\uD83D\uDC8E",
  },
  streak5: { de: "5er-Serie", en: "5 streak", icon: "\uD83D\uDD25" },
  streak10: { de: "10er-Serie", en: "10 streak", icon: "\u26A1" },
  coins100: { de: "100 M\u00fcnzen", en: "100 coins", icon: "\uD83E\uDE99" },
  perfect: { de: "Fehlerfrei", en: "Flawless", icon: "\uD83C\uDFAF" },
  explorer: { de: "Entdecker", en: "Explorer", icon: "\uD83E\uDDED" },
  speedy: { de: "Blitzrechner", en: "Speed solver", icon: "\uD83D\uDE80" },
  combo_master: {
    de: "Combo-Meister",
    en: "Combo master",
    icon: "\uD83C\uDF1F",
  },
};

/* ================================================================== */
/* 2. Pure math generators + validation (test-friendly)                */
/* ================================================================== */

// Inclusive random integer in [min, max].
function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Difficulty levels run from 1 (easiest) to 5 (hardest).
var MIN_LEVEL = 1;
var MAX_LEVEL = 5;

/*
 * Addition with 2 or 3 numbers, each between 0 and 100, and a sum that never
 * exceeds 100 so results stay inside the requested range.
 */
function generateAddition(level) {
  level = clamp(level || 1, MIN_LEVEL, MAX_LEVEL);
  var useThree = level >= 3 && Math.random() < (level >= 4 ? 0.6 : 0.35);
  var operands;
  if (useThree) {
    var capA = Math.min(40, 8 + level * 7);
    var a = randInt(0, capA);
    var b = randInt(0, Math.min(40, 100 - a));
    var c = randInt(0, 100 - a - b);
    operands = [a, b, c];
  } else {
    var maxFirst = Math.min(100, 18 + level * 16);
    var x = randInt(0, maxFirst);
    var y = randInt(0, 100 - x);
    operands = [x, y];
  }
  var answer = operands.reduce(function (sum, n) {
    return sum + n;
  }, 0);
  return {
    type: "add",
    operands: operands,
    text: operands.join(" + ") + " =",
    answer: answer,
  };
}

/*
 * Subtraction within 0..100. The minuend is always greater than or equal to
 * the subtrahend, so the result can never be negative in normal play.
 */
function generateSubtraction(level) {
  level = clamp(level || 1, MIN_LEVEL, MAX_LEVEL);
  var maxValue = Math.min(100, 20 + level * 16);
  var a = randInt(level < 2 ? 2 : 10, maxValue);
  var b = randInt(0, a);
  return {
    type: "sub",
    operands: [a, b],
    text: a + " \u2212 " + b + " =",
    answer: a - b,
  };
}

/*
 * Multiplication from 1x1 to 10x11: first factor 1..10, second factor 1..11.
 */
function generateMultiplication(level) {
  level = clamp(level || 1, MIN_LEVEL, MAX_LEVEL);
  var maxA = clamp(2 + level * 2, 1, 10);
  var maxB = clamp(3 + level * 2, 1, 11);
  var a = randInt(1, maxA);
  var b = randInt(1, maxB);
  return {
    type: "mul",
    operands: [a, b],
    text: a + " \u00d7 " + b + " =",
    answer: a * b,
  };
}

// Pick a generator for the chosen mode ("add", "sub", "mul" or "mix").
function generateTask(mode, level) {
  var effectiveMode = mode;
  if (mode === "mix") {
    var pool = ["add", "sub", "mul"];
    effectiveMode = pool[randInt(0, pool.length - 1)];
  }
  if (effectiveMode === "sub") return generateSubtraction(level);
  if (effectiveMode === "mul") return generateMultiplication(level);
  return generateAddition(level);
}

// Internal validation helper: confirms a task stays within allowed ranges.
function validateTask(task) {
  if (!task || typeof task.answer !== "number") return false;
  if (task.type === "add") {
    if (task.operands.length !== 2 && task.operands.length !== 3) return false;
    var inRange = task.operands.every(function (n) {
      return n >= 0 && n <= 100;
    });
    var sum = task.operands.reduce(function (s, n) {
      return s + n;
    }, 0);
    return inRange && sum === task.answer && sum >= 0 && sum <= 100;
  }
  if (task.type === "sub") {
    var a = task.operands[0];
    var b = task.operands[1];
    return (
      a >= 0 &&
      a <= 100 &&
      b >= 0 &&
      b <= 100 &&
      a - b === task.answer &&
      task.answer >= 0
    );
  }
  if (task.type === "mul") {
    var f1 = task.operands[0];
    var f2 = task.operands[1];
    return (
      f1 >= 1 && f1 <= 10 && f2 >= 1 && f2 <= 11 && f1 * f2 === task.answer
    );
  }
  return false;
}

// Build a short, child-friendly hint for a task (numbers are language-neutral).
function buildHint(task) {
  if (task.type === "add") {
    if (task.operands.length === 3) {
      var partial = task.operands[0] + task.operands[1];
      return (
        task.operands[0] +
        " + " +
        task.operands[1] +
        " = " +
        partial +
        ", " +
        partial +
        " + " +
        task.operands[2] +
        " = ?"
      );
    }
    var base = task.operands[0];
    var add = task.operands[1];
    return (
      base +
      " + " +
      add +
      ": " +
      base +
      " \u2192 " +
      (base + add) +
      " (+" +
      add +
      ")"
    );
  }
  if (task.type === "sub") {
    return (
      task.operands[1] +
      " + ? = " +
      task.operands[0] +
      "  (" +
      task.operands[0] +
      " \u2212 " +
      task.operands[1] +
      ")"
    );
  }
  if (task.type === "mul") {
    var a = task.operands[0];
    var b = task.operands[1];
    var chain = [];
    for (var i = 0; i < b && i < 6; i++) chain.push(String(a));
    var shown = chain.join(" + ");
    if (b > 6) shown += " + \u2026";
    return a + " \u00d7 " + b + " = " + shown;
  }
  return "";
}

/*
 * Build multiple-choice answers: the correct answer plus plausible, unique,
 * non-negative distractors, returned in random order. Pure + testable.
 */
function generateChoices(task, count) {
  count = clamp(count || 4, 4, 8);
  var correct = task.answer;
  var choices = [correct];
  var a = task.operands[0];
  var b = task.operands.length > 1 ? task.operands[1] : 0;
  var spread = Math.max(2, Math.round(Math.abs(correct) * 0.2)) + 3;
  var guard = 0;
  while (choices.length < count && guard < 400) {
    guard++;
    var candidate;
    if (task.type === "mul") {
      // Distractors that mimic common multiplication slips.
      var slips = [
        correct + a,
        correct - a,
        correct + b,
        correct - b,
        (a + 1) * b,
        a * (b + 1),
        correct + 1,
        correct - 1,
        correct + 2,
      ];
      candidate = slips[randInt(0, slips.length - 1)];
    } else {
      var delta = randInt(1, spread);
      candidate = Math.random() < 0.5 ? correct - delta : correct + delta;
    }
    if (candidate < 0) candidate = Math.abs(candidate);
    if (choices.indexOf(candidate) === -1) choices.push(candidate);
  }
  // Pad with near values if we could not find enough (very small answers).
  var pad = 1;
  while (choices.length < count) {
    var v = correct + pad;
    if (choices.indexOf(v) === -1) choices.push(v);
    pad++;
  }
  // Fisher-Yates shuffle so the correct answer is not always in one spot.
  for (var i = choices.length - 1; i > 0; i--) {
    var j = randInt(0, i);
    var tmp = choices[i];
    choices[i] = choices[j];
    choices[j] = tmp;
  }
  return choices;
}

// Number of answer choices for a level: 4 (easy) up to 8 (hard).
function choiceCountForLevel(level) {
  level = clamp(level || 1, MIN_LEVEL, MAX_LEVEL);
  return clamp(3 + level, 4, 8);
}

/*
 * Adaptive countdown in seconds, derived from the child's smoothed average
 * solving time (ms) and the current difficulty level. As the child gets
 * faster the average drops and the budget shrinks, so it evolves over time.
 * Pure + testable.
 */
function computeTimeBudget(avgMs, level) {
  level = clamp(level || 1, MIN_LEVEL, MAX_LEVEL);
  var base = avgMs && avgMs > 0 ? avgMs / 1000 : 11;
  var budget = base * 1.7 + 3 + (level - 1) * 1.2;
  return clamp(Math.round(budget), 6, 40);
}

// Smooth the average solving time with an exponential moving average (ms).
function updateAvgMs(prevAvg, sampleMs) {
  if (!sampleMs || sampleMs <= 0) return prevAvg || 0;
  sampleMs = clamp(sampleMs, 600, 60000); // ignore absurd outliers
  if (!prevAvg || prevAvg <= 0) return Math.round(sampleMs);
  return Math.round(prevAvg * 0.7 + sampleMs * 0.3);
}

/* ================================================================== */
/* The remaining code is the browser UI controller. It is wrapped so the     */
/* file can also be required by Node.js for unit tests without a DOM.        */
/* ================================================================== */

function startApp() {
  /* ---------------- Storage helpers ---------------- */
  var STORAGE_KEYS = {
    lang: "ms_lang",
    settings: "ms_settings",
    progress: "ms_progress",
  };

  function storageGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* Storage may be unavailable in private mode; fail silently. */
    }
  }

  /* ---------------- App state ---------------- */
  var state = {
    lang: storageGet(STORAGE_KEYS.lang, null),
    settings: Object.assign(
      { sound: false, timer: false, quick: false, blitz: true, choices: true },
      storageGet(STORAGE_KEYS.settings, {}),
    ),
    progress: Object.assign(
      {
        coins: 0,
        treasures: 0,
        badges: [],
        bestStreak: 0,
        avgMs: 0,
        totalCorrect: 0,
        lastPlayed: "",
        blitzWins: 0,
        bestCombo: 0,
      },
      storageGet(STORAGE_KEYS.progress, {}),
    ),
    selectedMode: "add",
    selectedDiff: "adaptive",
    run: null,
    timerId: null,
  };

  /* ---------------- i18n ---------------- */
  function t(key, vars) {
    var dict = I18N[state.lang] || I18N.de;
    var value = dict[key];
    if (value === undefined) value = I18N.de[key]; // fall back to German
    if (value === undefined) value = key;
    if (vars) {
      value = value.replace(/\{(\w+)\}/g, function (match, name) {
        return vars[name] !== undefined ? vars[name] : match;
      });
    }
    return value;
  }

  function applyI18n() {
    var lang = state.lang || "de";
    var meta =
      LANGUAGES.filter(function (l) {
        return l.code === lang;
      })[0] || LANGUAGES[0];
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", meta.dir);

    var nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
  }

  /* ---------------- Screen routing ---------------- */
  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    screens.forEach(function (s) {
      s.classList.toggle("is-active", s.id === id);
    });
  }

  /* ---------------- Element references ---------------- */
  var els = {
    languageGrid: document.getElementById("language-grid"),
    settingsLanguageGrid: document.getElementById("settings-language-grid"),
    menuCoins: document.getElementById("menu-coins"),
    menuTreasures: document.getElementById("menu-treasures"),
    menuBadges: document.getElementById("menu-badges"),
    gameStreak: document.getElementById("game-streak"),
    gameCoins: document.getElementById("game-coins"),
    gameTimer: document.getElementById("game-timer"),
    gameTimerChip: document.getElementById("game-timer-chip"),
    question: document.getElementById("game-question"),
    answerDisplay: document.getElementById("answer-display"),
    feedback: document.getElementById("feedback"),
    hint: document.getElementById("hint"),
    numpad: document.getElementById("numpad"),
    mapStations: document.getElementById("map-stations"),
    mapWalker: document.getElementById("map-walker"),
    mapPath: document.getElementById("map-path"),
    mapProgress: document.getElementById("map-progress"),
    sumStars: document.getElementById("sum-stars"),
    sumCoins: document.getElementById("sum-coins"),
    sumAccuracy: document.getElementById("sum-accuracy"),
    sumStreak: document.getElementById("sum-streak"),
    badgeShelf: document.getElementById("badge-shelf"),
    treasureLine: document.getElementById("treasure-line"),
    chest: document.getElementById("chest"),
    pauseOverlay: document.getElementById("pause-overlay"),
    fxLayer: document.getElementById("fx-layer"),
    howtoBody: document.querySelector(".howto-body"),
    toggleSound: document.getElementById("toggle-sound"),
    toggleTimer: document.getElementById("toggle-timer"),
    toggleQuick: document.getElementById("toggle-quick"),
    toggleQuickModes: document.getElementById("toggle-quick-modes"),
    toggleTimerModes: document.getElementById("toggle-timer-modes"),
    toggleBlitz: document.getElementById("toggle-blitz"),
    toggleChoices: document.getElementById("toggle-choices"),
    toggleBlitzModes: document.getElementById("toggle-blitz-modes"),
    numpadWrap: document.getElementById("numpad-wrap"),
    choices: document.getElementById("choices"),
    checkBtn: document.querySelector('[data-action="check"]'),
    timerRing: document.getElementById("timer-ring"),
    timerArc: document.getElementById("timer-arc"),
    timerNum: document.getElementById("timer-num"),
    blitzTag: document.getElementById("blitz-tag"),
    comboTag: document.getElementById("combo-tag"),
    mascot: document.getElementById("mascot"),
    mascotBubble: document.getElementById("mascot-bubble"),
    mapTrail: document.getElementById("map-trail"),
    mapStationsFx: document.getElementById("map-stations-fx"),
    reviewBox: document.getElementById("review-box"),
    reviewList: document.getElementById("review-list"),
  };

  /* ---------------- Optional sound (synthesised, no asset files) ---------------- */
  var audioCtx = null;
  function beep(frequency, durationMs, type) {
    if (!state.settings.sound) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = frequency;
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + durationMs / 1000,
      );
      osc.stop(audioCtx.currentTime + durationMs / 1000);
    } catch (e) {
      /* Audio is a nice-to-have; ignore failures. */
    }
  }

  /* ---------------- Header / menu stats ---------------- */
  function refreshMenuStats() {
    els.menuCoins.textContent = state.progress.coins;
    els.menuTreasures.textContent = state.progress.treasures;
    els.menuBadges.textContent = state.progress.badges.length;
  }

  /* ---------------- Language grids ---------------- */
  function buildLanguageButton(meta, onPick) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-btn";
    btn.setAttribute("lang", meta.code);
    if (meta.code === state.lang) btn.classList.add("is-selected");
    var flag = document.createElement("span");
    flag.className = "flag";
    flag.setAttribute("aria-hidden", "true");
    flag.textContent = meta.flag;
    var label = document.createElement("span");
    label.textContent = meta.label;
    btn.appendChild(flag);
    btn.appendChild(label);
    btn.addEventListener("click", function () {
      onPick(meta.code);
    });
    return btn;
  }

  function renderLanguageGrids() {
    els.languageGrid.innerHTML = "";
    els.settingsLanguageGrid.innerHTML = "";
    LANGUAGES.forEach(function (meta) {
      els.languageGrid.appendChild(
        buildLanguageButton(meta, function (code) {
          setLanguage(code);
          goToMenu();
        }),
      );
      els.settingsLanguageGrid.appendChild(
        buildLanguageButton(meta, function (code) {
          setLanguage(code);
          renderLanguageGrids();
        }),
      );
    });
  }

  function setLanguage(code) {
    state.lang = code;
    storageSet(STORAGE_KEYS.lang, code);
    applyI18n();
    refreshDynamicText();
  }

  // Refresh strings that are not driven by [data-i18n] attributes.
  function refreshDynamicText() {
    els.howtoBody.textContent = t("howto_body");
    document
      .querySelector('[data-action="pause"]')
      .setAttribute("aria-label", t("paused"));
    if (state.run) updateMapProgressLabel();
  }

  /* ---------------- Number pad ---------------- */
  var currentInput = "";
  function buildNumpad() {
    var layout = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "clear",
      "0",
      "del",
    ];
    els.numpad.innerHTML = "";
    layout.forEach(function (item) {
      var key = document.createElement("button");
      key.type = "button";
      key.className = "key";
      if (item === "clear" || item === "del") key.className += " key--action";
      if (item === "clear") {
        key.textContent = "C";
        key.setAttribute("aria-label", "Clear");
      } else if (item === "del") {
        key.textContent = "\u232B";
        key.setAttribute("aria-label", "Delete");
      } else {
        key.textContent = item;
      }
      key.addEventListener("click", function () {
        handleKey(item);
      });
      els.numpad.appendChild(key);
    });
  }

  function handleKey(item) {
    if (item === "clear") {
      currentInput = "";
    } else if (item === "del") {
      currentInput = currentInput.slice(0, -1);
    } else if (/^[0-9]$/.test(item)) {
      if (currentInput.length < 3) currentInput += item; // max answer is 121
    }
    renderAnswer();
  }

  function renderAnswer() {
    els.answerDisplay.textContent = currentInput === "" ? "_" : currentInput;
    els.answerDisplay.classList.remove("is-correct", "is-wrong");
  }

  /* ---------------- Adventure run ---------------- */
  var DIFF_START_LEVEL = { easy: 1, medium: 3, hard: 5, adaptive: 2 };

  function startRun() {
    var total = state.settings.quick ? 10 : 18; // ~15 min for a full run
    state.run = {
      mode: state.selectedMode,
      diff: state.selectedDiff,
      level: DIFF_START_LEVEL[state.selectedDiff] || 2,
      index: 0,
      total: total,
      correct: 0,
      firstTry: 0,
      attemptsOnCurrent: 0,
      stars: 0,
      coins: 0,
      streak: 0,
      bestStreak: 0,
      combo: 1,
      blitzWins: 0,
      timeBonus: 0,
      starStations: [],
      missed: [],
      taskStart: 0,
      newBadges: [],
    };
    grantDailyBonus();
    hideComboTag();
    buildMap(total);
    showScreen("screen-game");
    nextTask();
  }

  // The first run of each calendar day grants a small welcome bonus, to gently
  // encourage the "little and often" habit that the research recommends.
  function grantDailyBonus() {
    var today = new Date().toISOString().slice(0, 10);
    if (state.progress.lastPlayed !== today) {
      state.progress.lastPlayed = today;
      var bonus = 15;
      state.progress.coins += bonus;
      storageSet(STORAGE_KEYS.progress, state.progress);
      refreshMenuStats();
      showToast(t("daily_bonus", { n: bonus }), "\uD83C\uDF1E");
    }
  }

  function buildMap(total) {
    els.mapStations.innerHTML = "";
    if (els.mapStationsFx) els.mapStationsFx.innerHTML = "";
    var path = els.mapPath;
    var length = path.getTotalLength ? path.getTotalLength() : 0;
    // Prepare the animated trail (the filled-in part of the route).
    if (els.mapTrail && length) {
      els.mapTrail.style.strokeDasharray = length + " " + length;
      els.mapTrail.style.strokeDashoffset = String(length);
    }
    for (var i = 0; i < total; i++) {
      var ratio = total > 1 ? i / (total - 1) : 0;
      var point =
        length && path.getPointAtLength
          ? path.getPointAtLength(ratio * length)
          : { x: 20 + ratio * 960, y: 90 };
      var circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", point.x);
      circle.setAttribute("cy", point.y);
      circle.setAttribute("r", "10");
      circle.setAttribute("class", "map-station");
      circle.dataset.index = String(i);
      els.mapStations.appendChild(circle);
      // A little flag on every fifth station as a milestone marker.
      if (els.mapStationsFx && (i % 5 === 4 || i === total - 1)) {
        var flag = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        flag.setAttribute("x", point.x);
        flag.setAttribute("y", point.y - 16);
        flag.setAttribute("text-anchor", "middle");
        flag.setAttribute("font-size", "22");
        flag.textContent = i === total - 1 ? "\uD83C\uDFC1" : "\uD83D\uDEA9";
        els.mapStationsFx.appendChild(flag);
      }
    }
    moveWalker(0);
  }

  function moveWalker(index) {
    var path = els.mapPath;
    var total = state.run ? state.run.total : 1;
    var ratio = total > 1 ? clamp(index, 0, total - 1) / (total - 1) : 0;
    if (path.getTotalLength && path.getPointAtLength) {
      var len = path.getTotalLength();
      var pt = path.getPointAtLength(ratio * len);
      els.mapWalker.setAttribute("x", pt.x);
      els.mapWalker.setAttribute("y", pt.y - 16);
      // Fill the colourful trail up to the walker's position.
      if (els.mapTrail) {
        els.mapTrail.style.strokeDashoffset = String(len - ratio * len);
      }
    }
    var stations = els.mapStations.querySelectorAll(".map-station");
    stations.forEach(function (s, i) {
      s.classList.toggle("is-done", i < index);
      s.classList.toggle("is-current", i === index);
      s.classList.toggle(
        "is-star",
        !!(state.run && state.run.starStations.indexOf(i) !== -1),
      );
    });
  }

  function updateMapProgressLabel() {
    els.mapProgress.textContent = t("station_progress", {
      n: Math.min(state.run.index + 1, state.run.total),
      total: state.run.total,
    });
  }

  var activeTask = null;
  function nextTask() {
    if (state.run.index >= state.run.total) {
      finishRun();
      return;
    }
    state.run.attemptsOnCurrent = 0;
    activeTask = generateTask(state.run.mode, state.run.level);
    // Safety net: regenerate if a task ever falls outside the valid ranges.
    var guard = 0;
    while (!validateTask(activeTask) && guard < 10) {
      activeTask = generateTask(state.run.mode, state.run.level);
      guard++;
    }
    // Decide per task whether it is timed (Blitz) and/or multiple choice.
    activeTask.timed =
      state.settings.timer || (state.settings.blitz && Math.random() < 0.4);
    activeTask.choice = state.settings.choices && Math.random() < 0.5;

    currentInput = "";
    els.question.textContent = activeTask.text;
    els.feedback.textContent = "";
    els.feedback.className = "feedback";
    els.hint.hidden = true;
    els.hint.textContent = "";
    renderAnswer();
    setupAnswerMode();
    moveWalker(state.run.index);
    updateMapProgressLabel();
    state.run.taskStart = now();
    restartTimer();
  }

  function now() {
    return typeof window !== "undefined" &&
      window.performance &&
      window.performance.now
      ? window.performance.now()
      : Date.now();
  }

  // Switch the input area between number pad and multiple-choice buttons,
  // and reveal the Blitz badge for timed tasks.
  function setupAnswerMode() {
    var useChoice = !!activeTask.choice;
    if (els.numpadWrap) els.numpadWrap.hidden = useChoice;
    if (els.checkBtn) els.checkBtn.hidden = useChoice;
    if (els.answerDisplay) els.answerDisplay.hidden = useChoice;
    if (els.choices) els.choices.hidden = !useChoice;
    if (useChoice) renderChoices();
    if (els.blitzTag) els.blitzTag.hidden = !activeTask.timed;
  }

  function renderChoices() {
    els.choices.innerHTML = "";
    var count = choiceCountForLevel(state.run.level);
    var options = generateChoices(activeTask, count);
    options.forEach(function (value) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.textContent = String(value);
      btn.addEventListener("click", function () {
        if (btn.disabled) return;
        submitAnswer(value, btn);
      });
      els.choices.appendChild(btn);
    });
  }

  function checkAnswer() {
    if (!activeTask || activeTask.choice || currentInput === "") return;
    submitAnswer(parseInt(currentInput, 10), null);
  }

  // Shared entry point for both the number pad and the choice buttons.
  function submitAnswer(value, sourceBtn) {
    if (!activeTask) return;
    state.run.attemptsOnCurrent++;
    if (value === activeTask.answer) {
      if (sourceBtn) markChoice(true, sourceBtn);
      onCorrect();
    } else {
      if (sourceBtn) markChoice(false, sourceBtn);
      onWrong();
    }
  }

  function markChoice(correct, btn) {
    btn.classList.add(correct ? "is-correct" : "is-wrong");
    if (correct && els.choices) {
      els.choices.querySelectorAll(".choice").forEach(function (c) {
        c.disabled = true;
      });
    }
  }

  function onCorrect() {
    var firstTry = state.run.attemptsOnCurrent === 1;
    var elapsed = state.run.taskStart ? now() - state.run.taskStart : 0;
    state.run.correct++;
    if (firstTry) {
      state.run.firstTry++;
      state.run.starStations.push(state.run.index);
    }
    state.run.streak++;
    if (state.run.streak > state.run.bestStreak) {
      state.run.bestStreak = state.run.streak;
    }

    // Combo multiplier grows with the streak (x1 .. x4).
    state.run.combo = clamp(1 + Math.floor(state.run.streak / 3), 1, 4);

    // Learn the child's pace so the adaptive timer evolves with them.
    if (firstTry && elapsed > 0) {
      state.progress.avgMs = updateAvgMs(state.progress.avgMs, elapsed);
      state.progress.totalCorrect = (state.progress.totalCorrect || 0) + 1;
    }

    var base = firstTry ? 10 : 4;
    var earned = (base + Math.min(state.run.streak, 10)) * state.run.combo;

    // Beating the Blitz timer earns bonus coins.
    var timeBonus = 0;
    if (activeTask.timed && firstTry && state.timerRemaining > 0) {
      timeBonus = Math.min(10, Math.ceil(state.timerRemaining));
      state.run.blitzWins++;
      state.run.timeBonus += timeBonus;
    }
    earned += timeBonus;

    state.run.coins += earned;
    state.run.stars += firstTry ? 1 : 0;
    els.gameStreak.textContent = state.run.streak;
    els.gameCoins.textContent = state.run.coins;
    els.answerDisplay.classList.add("is-correct");
    els.feedback.textContent = t("feedback_correct");
    els.feedback.className = "feedback is-correct";
    showComboTag();
    floatCoins(earned);
    if (timeBonus > 0)
      showToast(t("time_bonus", { n: timeBonus }), "\u23F1\uFE0F");
    mascotSay(pickPraise(), "\uD83E\uDD9C");
    haptic(firstTry ? 20 : 12);
    beep(660, 140, "triangle");
    stopTimer();

    // Adaptive difficulty: speed up when the child is on a roll.
    if (
      state.run.diff === "adaptive" &&
      state.run.streak > 0 &&
      state.run.streak % 3 === 0
    ) {
      state.run.level = clamp(state.run.level + 1, MIN_LEVEL, MAX_LEVEL);
    }

    state.run.index++;
    moveWalker(state.run.index);
    window.setTimeout(nextTask, 750);
  }

  function onWrong() {
    state.run.streak = 0;
    state.run.combo = 1;
    hideComboTag();
    els.gameStreak.textContent = 0;
    els.answerDisplay.classList.add("is-wrong");
    els.feedback.textContent = t("feedback_wrong");
    els.feedback.className = "feedback is-wrong";
    els.hint.textContent = buildHint(activeTask);
    els.hint.hidden = false;
    mascotSay(pickEncourage(), "\uD83E\uDD9C");
    haptic([8, 40, 8]);
    beep(180, 220, "sawtooth");
    recordMiss();

    // Adaptive difficulty: ease off after a mistake.
    if (state.run.diff === "adaptive") {
      state.run.level = clamp(state.run.level - 1, MIN_LEVEL, MAX_LEVEL);
    }
    currentInput = "";
    renderAnswer();
    // In choice mode a wrong tap should not strand the child: clear it shortly.
    if (activeTask.choice && els.choices) {
      window.setTimeout(function () {
        els.choices.querySelectorAll(".choice.is-wrong").forEach(function (c) {
          c.classList.remove("is-wrong");
        });
      }, 700);
    }
  }

  // Remember a missed task so we can show a short review at the end.
  function recordMiss() {
    if (!activeTask) return;
    var text =
      activeTask.text.replace(/\s*=\s*$/, "") + " = " + activeTask.answer;
    if (state.run.missed.indexOf(text) === -1) state.run.missed.push(text);
  }

  function showHint() {
    if (!activeTask) return;
    els.hint.textContent = buildHint(activeTask);
    els.hint.hidden = false;
  }

  /* ---------------- Juicy feedback helpers ---------------- */
  function pickPraise() {
    return t("praise_" + randInt(1, 3));
  }
  function pickEncourage() {
    return t("encourage_" + randInt(1, 3));
  }
  function mascotSay(message, face) {
    if (!els.mascot || !els.mascotBubble) return;
    els.mascot.textContent = face || "\uD83E\uDD9C";
    els.mascotBubble.textContent = message;
    els.mascot.classList.remove("is-pop");
    void els.mascot.offsetWidth; // restart the pop animation
    els.mascot.classList.add("is-pop");
  }
  function showComboTag() {
    if (!els.comboTag) return;
    if (state.run.combo > 1) {
      els.comboTag.textContent = t("combo_tag", { x: state.run.combo });
      els.comboTag.hidden = false;
      els.comboTag.classList.remove("is-pop");
      void els.comboTag.offsetWidth;
      els.comboTag.classList.add("is-pop");
    } else {
      hideComboTag();
    }
  }
  function hideComboTag() {
    if (els.comboTag) els.comboTag.hidden = true;
  }
  function floatCoins(amount) {
    if (!els.fxLayer) return;
    var node = document.createElement("span");
    node.className = "float-coin";
    node.textContent = "+" + amount + " \uD83E\uDE99";
    els.fxLayer.appendChild(node);
    window.setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 1200);
  }
  function showToast(message, icon) {
    if (!els.fxLayer) return;
    var node = document.createElement("div");
    node.className = "toast";
    node.textContent = (icon ? icon + " " : "") + message;
    els.fxLayer.appendChild(node);
    window.setTimeout(function () {
      node.classList.add("is-out");
    }, 1400);
    window.setTimeout(function () {
      if (node.parentNode) node.parentNode.removeChild(node);
    }, 2000);
  }
  function haptic(pattern) {
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      /* Vibration is optional. */
    }
  }

  /* ---------------- Adaptive Blitz timer ---------------- */
  // Circumference of the ring (r = 26 -> 2 * pi * 26 ~= 163.36).
  var RING_LEN = 163.36;
  function restartTimer() {
    stopTimer();
    state.timerRemaining = 0;
    if (!activeTask || !activeTask.timed) {
      if (els.timerRing) els.timerRing.hidden = true;
      return;
    }
    var budget = computeTimeBudget(state.progress.avgMs, state.run.level);
    state.timerRemaining = budget;
    if (els.timerRing) {
      els.timerRing.hidden = false;
      els.timerRing.classList.remove("is-low");
    }
    updateTimerRing(budget, budget);
    state.timerDeadline = Date.now() + budget * 1000;
    state.timerId = window.setInterval(function () {
      var remaining = Math.max(0, (state.timerDeadline - Date.now()) / 1000);
      state.timerRemaining = remaining;
      updateTimerRing(remaining, budget);
      if (remaining <= 0) {
        stopTimer();
        onTimeout();
      }
    }, 100);
  }
  function updateTimerRing(remaining, budget) {
    if (els.timerNum) els.timerNum.textContent = String(Math.ceil(remaining));
    if (els.timerArc && els.timerRing) {
      var frac = budget > 0 ? clamp(remaining / budget, 0, 1) : 0;
      els.timerArc.style.strokeDashoffset = String((1 - frac) * RING_LEN);
      els.timerRing.classList.toggle(
        "is-low",
        remaining <= Math.max(3, budget * 0.25),
      );
    }
  }
  function onTimeout() {
    if (state.run.attemptsOnCurrent === 0) state.run.attemptsOnCurrent = 1;
    els.feedback.textContent = t("timeout_msg");
    els.feedback.className = "feedback is-wrong";
    els.hint.textContent = buildHint(activeTask);
    els.hint.hidden = false;
    mascotSay(pickEncourage(), "\u23F0");
    haptic([10, 40, 10]);
    beep(160, 240, "sawtooth");
    state.run.streak = 0;
    state.run.combo = 1;
    hideComboTag();
    els.gameStreak.textContent = 0;
    recordMiss();
    if (state.run.diff === "adaptive") {
      state.run.level = clamp(state.run.level - 1, MIN_LEVEL, MAX_LEVEL);
    }
    state.run.index++;
    moveWalker(state.run.index);
    window.setTimeout(nextTask, 1000);
  }
  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
    if (els.timerRing) els.timerRing.hidden = true;
  }

  /* ---------------- Finish + rewards ---------------- */
  function awardBadge(id) {
    if (state.progress.badges.indexOf(id) !== -1) return;
    state.progress.badges.push(id);
    state.run.newBadges.push(id);
  }

  function evaluateBadges() {
    if (state.progress.treasures >= 1) awardBadge("first_treasure");
    if (state.run.bestStreak >= 5) awardBadge("streak5");
    if (state.run.bestStreak >= 10) awardBadge("streak10");
    if (state.progress.coins >= 100) awardBadge("coins100");
    if (state.run.firstTry === state.run.total) awardBadge("perfect");
    if (state.progress.treasures >= 5) awardBadge("explorer");
    if (state.progress.blitzWins >= 10) awardBadge("speedy");
    if (state.run.combo >= 4) awardBadge("combo_master");
  }

  function badgeLabel(id) {
    var entry = BADGE_LABELS[id];
    if (!entry) return id;
    var text = entry[state.lang] || entry.de;
    return entry.icon + " " + text;
  }

  function finishRun() {
    stopTimer();
    // Persist progress.
    state.progress.coins += state.run.coins;
    state.progress.treasures += 1;
    if (state.run.bestStreak > state.progress.bestStreak) {
      state.progress.bestStreak = state.run.bestStreak;
    }
    if (state.run.combo > (state.progress.bestCombo || 0)) {
      state.progress.bestCombo = state.run.combo;
    }
    state.progress.blitzWins =
      (state.progress.blitzWins || 0) + state.run.blitzWins;
    evaluateBadges();
    storageSet(STORAGE_KEYS.progress, state.progress);

    // Fill summary screen.
    var accuracy =
      state.run.total > 0
        ? Math.round((state.run.correct / state.run.total) * 100)
        : 0;
    els.sumStars.textContent = state.run.stars;
    els.sumCoins.textContent = state.run.coins;
    els.sumAccuracy.textContent = accuracy + "%";
    els.sumStreak.textContent = state.run.bestStreak;
    els.treasureLine.textContent = pickTreasure();

    renderReview();
    renderBadges();
    showScreen("screen-summary");
    els.chest.classList.add("is-shaking");
    refreshMenuStats();
  }

  // Show up to six missed tasks so the child can practise them again.
  function renderReview() {
    if (!els.reviewBox || !els.reviewList) return;
    els.reviewList.innerHTML = "";
    if (!state.run.missed.length) {
      els.reviewBox.hidden = true;
      return;
    }
    els.reviewBox.hidden = false;
    var head = els.reviewBox.querySelector(".review-title");
    if (head) head.textContent = t("review_title");
    state.run.missed.slice(0, 6).forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      els.reviewList.appendChild(li);
    });
  }

  // Random final treasure description, recombined every run.
  function pickTreasure() {
    var chests = [
      "\uD83D\uDC8E",
      "\uD83D\uDC51",
      "\uD83E\uDED9",
      "\uD83C\uDFC6",
      "\u2728",
      "\uD83E\uDDED",
      "\uD83D\uDDDD\uFE0F",
      "\uD83D\uDC8D",
    ];
    var pick = chests[randInt(0, chests.length - 1)];
    return pick + " " + t("treasure_found");
  }

  function renderBadges() {
    els.badgeShelf.innerHTML = "";
    state.progress.badges.forEach(function (id) {
      var span = document.createElement("span");
      span.className = "badge";
      if (state.run.newBadges.indexOf(id) !== -1)
        span.className += " badge--new";
      span.textContent = badgeLabel(id);
      els.badgeShelf.appendChild(span);
    });
  }

  function openChest() {
    els.chest.classList.remove("is-shaking");
    els.chest.classList.add("is-open");
    burstConfetti();
    beep(880, 200, "triangle");
    window.setTimeout(function () {
      els.chest.classList.remove("is-open");
    }, 600);
  }

  /* ---------------- Confetti FX (pure DOM/CSS) ---------------- */
  function burstConfetti() {
    var colors = ["#ff8a3d", "#6c5ce7", "#18c29c", "#ffc83d", "#ef6a5a"];
    for (var i = 0; i < 40; i++) {
      var piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      piece.style.animationDelay = Math.random() * 0.3 + "s";
      els.fxLayer.appendChild(piece);
      (function (node) {
        window.setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
        }, 3200);
      })(piece);
    }
  }

  /* ---------------- Navigation helpers ---------------- */
  function goToMenu() {
    stopTimer();
    state.run = null;
    refreshMenuStats();
    showScreen("screen-menu");
  }

  /* ---------------- Mode + difficulty selection ---------------- */
  function wireModeSelection() {
    document.querySelectorAll(".mode-card").forEach(function (card) {
      card.addEventListener("click", function () {
        state.selectedMode = card.dataset.mode;
        document.querySelectorAll(".mode-card").forEach(function (c) {
          var selected = c === card;
          c.classList.toggle("is-selected", selected);
          c.setAttribute("aria-checked", selected ? "true" : "false");
        });
      });
    });
    document.querySelectorAll(".chip[data-diff]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.selectedDiff = chip.dataset.diff;
        document.querySelectorAll(".chip[data-diff]").forEach(function (c) {
          var selected = c === chip;
          c.classList.toggle("is-selected", selected);
          c.setAttribute("aria-checked", selected ? "true" : "false");
        });
      });
    });
  }

  /* ---------------- Settings toggles ---------------- */
  function syncToggles() {
    els.toggleSound.checked = state.settings.sound;
    els.toggleTimer.checked = state.settings.timer;
    els.toggleQuick.checked = state.settings.quick;
    els.toggleTimerModes.checked = state.settings.timer;
    els.toggleQuickModes.checked = state.settings.quick;
    if (els.toggleBlitz) els.toggleBlitz.checked = state.settings.blitz;
    if (els.toggleChoices) els.toggleChoices.checked = state.settings.choices;
    if (els.toggleBlitzModes)
      els.toggleBlitzModes.checked = state.settings.blitz;
  }
  function persistSettings() {
    storageSet(STORAGE_KEYS.settings, state.settings);
  }
  function wireToggles() {
    function bind(input, key, mirror) {
      if (!input) return;
      input.addEventListener("change", function () {
        state.settings[key] = input.checked;
        persistSettings();
        if (mirror) mirror.checked = input.checked;
      });
    }
    bind(els.toggleSound, "sound");
    bind(els.toggleTimer, "timer", els.toggleTimerModes);
    bind(els.toggleQuick, "quick", els.toggleQuickModes);
    bind(els.toggleTimerModes, "timer", els.toggleTimer);
    bind(els.toggleQuickModes, "quick", els.toggleQuick);
    bind(els.toggleBlitz, "blitz", els.toggleBlitzModes);
    bind(els.toggleBlitzModes, "blitz", els.toggleBlitz);
    bind(els.toggleChoices, "choices");
  }

  function resetProgress() {
    if (!window.confirm(t("reset_confirm"))) return;
    state.progress = {
      coins: 0,
      treasures: 0,
      badges: [],
      bestStreak: 0,
      avgMs: 0,
      totalCorrect: 0,
      lastPlayed: "",
      blitzWins: 0,
      bestCombo: 0,
    };
    storageSet(STORAGE_KEYS.progress, state.progress);
    refreshMenuStats();
  }

  /* ---------------- Global action handling ---------------- */
  function handleAction(action) {
    switch (action) {
      case "go-modes":
        syncToggles();
        showScreen("screen-modes");
        break;
      case "go-menu":
        goToMenu();
        break;
      case "go-settings":
        syncToggles();
        renderLanguageGrids();
        showScreen("screen-settings");
        break;
      case "go-howto":
        showScreen("screen-howto");
        break;
      case "start-run":
        startRun();
        break;
      case "check":
        checkAnswer();
        break;
      case "hint":
        showHint();
        break;
      case "pause":
        stopTimer();
        els.pauseOverlay.hidden = false;
        break;
      case "resume":
        els.pauseOverlay.hidden = true;
        if (state.run) restartTimer();
        break;
      case "quit":
        els.pauseOverlay.hidden = true;
        goToMenu();
        break;
      case "play-again":
        startRun();
        break;
      case "reset":
        resetProgress();
        break;
      default:
        break;
    }
  }

  function wireActions() {
    document.body.addEventListener("click", function (event) {
      var target = event.target.closest("[data-action]");
      if (!target) return;
      handleAction(target.getAttribute("data-action"));
    });

    // Chest can be opened by tap, click, Enter or Space.
    els.chest.addEventListener("click", openChest);
    els.chest.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openChest();
      }
    });

    // Physical keyboard support for the number pad.
    document.addEventListener("keydown", function (event) {
      if (
        !document.getElementById("screen-game").classList.contains("is-active")
      ) {
        return;
      }
      if (/^[0-9]$/.test(event.key)) {
        handleKey(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        handleKey("del");
      } else if (event.key === "Enter") {
        event.preventDefault();
        checkAnswer();
      } else if (event.key === "Escape") {
        handleAction("pause");
      }
    });
  }

  /* ---------------- Service worker registration ---------------- */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("service-worker.js")
          .catch(function () {
            /* Offline support is optional; ignore registration errors. */
          });
      });
    }
  }

  /* ---------------- Boot ---------------- */
  function init() {
    buildNumpad();
    wireModeSelection();
    wireToggles();
    wireActions();
    renderLanguageGrids();
    refreshMenuStats();

    if (state.lang && I18N[state.lang]) {
      applyI18n();
      refreshDynamicText();
      goToMenu();
    } else {
      state.lang = "de"; // default/fallback language
      applyI18n();
      refreshDynamicText();
      showScreen("screen-language");
    }

    registerServiceWorker();
  }

  init();
}

/* ================================================================== */
/* Bootstrap (browser) or export (Node test runner)                    */
/* ================================================================== */
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LANGUAGES: LANGUAGES,
    I18N: I18N,
    randInt: randInt,
    clamp: clamp,
    generateAddition: generateAddition,
    generateSubtraction: generateSubtraction,
    generateMultiplication: generateMultiplication,
    generateTask: generateTask,
    validateTask: validateTask,
    buildHint: buildHint,
    generateChoices: generateChoices,
    choiceCountForLevel: choiceCountForLevel,
    computeTimeBudget: computeTimeBudget,
    updateAvgMs: updateAvgMs,
  };
}
