"""Seed data for CodeMaster Academy: languages, courses, lessons, quizzes, exercises, paths, projects."""
from typing import List, Dict, Any

# 17 programming languages with metadata
LANGUAGES: List[Dict[str, Any]] = [
    {"id": "python", "name": "Python", "icon_family": "MaterialCommunityIcons", "icon_name": "language-python", "color": "#3B82F6", "tagline": {"it": "Linguaggio versatile per AI, web e data science", "en": "Versatile language for AI, web and data science", "es": "Lenguaje versátil para IA, web y ciencia de datos", "fr": "Langage polyvalent pour IA, web et data science", "de": "Vielseitige Sprache für KI, Web und Data Science", "pt": "Linguagem versátil para IA, web e ciência de dados"}, "has_full_content": True, "order": 1},
    {"id": "javascript", "name": "JavaScript", "icon_family": "MaterialCommunityIcons", "icon_name": "language-javascript", "color": "#F59E0B", "tagline": {"it": "Il linguaggio del web moderno", "en": "The language of the modern web", "es": "El lenguaje de la web moderna", "fr": "Le langage du web moderne", "de": "Die Sprache des modernen Webs", "pt": "A linguagem da web moderna"}, "has_full_content": True, "order": 2},
    {"id": "html_css", "name": "HTML/CSS", "icon_family": "MaterialCommunityIcons", "icon_name": "language-html5", "color": "#EF4444", "tagline": {"it": "Le fondamenta di ogni sito web", "en": "The foundation of every website", "es": "Los cimientos de toda página web", "fr": "Les fondations de tout site web", "de": "Die Grundlage jeder Website", "pt": "A base de todo site web"}, "has_full_content": True, "order": 3},
    {"id": "java", "name": "Java", "icon_family": "MaterialCommunityIcons", "icon_name": "language-java", "color": "#EF4444", "tagline": {"it": "Robusto, scalabile, multipiattaforma", "en": "Robust, scalable, cross-platform", "es": "Robusto, escalable, multiplataforma", "fr": "Robuste, scalable, multiplateforme", "de": "Robust, skalierbar, plattformübergreifend", "pt": "Robusto, escalável, multiplataforma"}, "has_full_content": False, "order": 4},
    {"id": "cpp", "name": "C++", "icon_family": "MaterialCommunityIcons", "icon_name": "language-cpp", "color": "#3B82F6", "tagline": {"it": "Performance massima e controllo totale", "en": "Max performance and total control", "es": "Máximo rendimiento y control total", "fr": "Performance maximale et contrôle total", "de": "Maximale Leistung und volle Kontrolle", "pt": "Desempenho máximo e controle total"}, "has_full_content": False, "order": 5},
    {"id": "csharp", "name": "C#", "icon_family": "MaterialCommunityIcons", "icon_name": "language-csharp", "color": "#8B5CF6", "tagline": {"it": "Il linguaggio Microsoft per app e giochi", "en": "Microsoft's language for apps and games", "es": "Lenguaje de Microsoft para apps y juegos", "fr": "Langage Microsoft pour apps et jeux", "de": "Microsofts Sprache für Apps und Spiele", "pt": "Linguagem Microsoft para apps e jogos"}, "has_full_content": False, "order": 6},
    {"id": "php", "name": "PHP", "icon_family": "MaterialCommunityIcons", "icon_name": "language-php", "color": "#6366F1", "tagline": {"it": "Backend web tradizionale", "en": "Traditional web backend", "es": "Backend web tradicional", "fr": "Backend web traditionnel", "de": "Traditionelles Web-Backend", "pt": "Backend web tradicional"}, "has_full_content": False, "order": 7},
    {"id": "sql", "name": "SQL", "icon_family": "MaterialCommunityIcons", "icon_name": "database", "color": "#14B8A6", "tagline": {"it": "Interroga e gestisci database", "en": "Query and manage databases", "es": "Consulta y gestiona bases de datos", "fr": "Interroger et gérer des bases", "de": "Datenbanken abfragen und verwalten", "pt": "Consulte e gerencie bancos de dados"}, "has_full_content": False, "order": 8},
    {"id": "kotlin", "name": "Kotlin", "icon_family": "MaterialCommunityIcons", "icon_name": "language-kotlin", "color": "#8B5CF6", "tagline": {"it": "Moderno per sviluppo Android", "en": "Modern for Android development", "es": "Moderno para desarrollo Android", "fr": "Moderne pour le développement Android", "de": "Modern für Android-Entwicklung", "pt": "Moderno para desenvolvimento Android"}, "has_full_content": False, "order": 9},
    {"id": "swift", "name": "Swift", "icon_family": "MaterialCommunityIcons", "icon_name": "language-swift", "color": "#F97316", "tagline": {"it": "Per app iOS native", "en": "For native iOS apps", "es": "Para apps nativas de iOS", "fr": "Pour applications iOS natives", "de": "Für native iOS-Apps", "pt": "Para apps iOS nativos"}, "has_full_content": False, "order": 10},
    {"id": "typescript", "name": "TypeScript", "icon_family": "MaterialCommunityIcons", "icon_name": "language-typescript", "color": "#3B82F6", "tagline": {"it": "JavaScript con tipi statici", "en": "JavaScript with static types", "es": "JavaScript con tipos estáticos", "fr": "JavaScript avec typage statique", "de": "JavaScript mit statischen Typen", "pt": "JavaScript com tipos estáticos"}, "has_full_content": False, "order": 11},
    {"id": "go", "name": "Go", "icon_family": "MaterialCommunityIcons", "icon_name": "language-go", "color": "#0EA5E9", "tagline": {"it": "Veloce e concorrente di Google", "en": "Fast and concurrent from Google", "es": "Rápido y concurrente de Google", "fr": "Rapide et concurrent de Google", "de": "Schnell und nebenläufig von Google", "pt": "Rápido e concorrente do Google"}, "has_full_content": False, "order": 12},
    {"id": "rust", "name": "Rust", "icon_family": "MaterialCommunityIcons", "icon_name": "language-rust", "color": "#0F172A", "tagline": {"it": "Sicurezza e performance senza compromessi", "en": "Safety and performance, no compromises", "es": "Seguridad y rendimiento sin compromisos", "fr": "Sécurité et performance sans compromis", "de": "Sicherheit und Leistung ohne Kompromisse", "pt": "Segurança e desempenho sem compromisso"}, "has_full_content": False, "order": 13},
    {"id": "ruby", "name": "Ruby", "icon_family": "MaterialCommunityIcons", "icon_name": "language-ruby", "color": "#EF4444", "tagline": {"it": "Elegante e produttivo", "en": "Elegant and productive", "es": "Elegante y productivo", "fr": "Élégant et productif", "de": "Elegant und produktiv", "pt": "Elegante e produtivo"}, "has_full_content": False, "order": 14},
    {"id": "dart", "name": "Dart", "icon_family": "MaterialIcons", "icon_name": "code", "color": "#0EA5E9", "tagline": {"it": "Il linguaggio di Flutter", "en": "The language of Flutter", "es": "El lenguaje de Flutter", "fr": "Le langage de Flutter", "de": "Die Sprache von Flutter", "pt": "A linguagem do Flutter"}, "has_full_content": False, "order": 15},
    {"id": "r", "name": "R", "icon_family": "MaterialCommunityIcons", "icon_name": "language-r", "color": "#2563EB", "tagline": {"it": "Statistiche e data science", "en": "Statistics and data science", "es": "Estadísticas y ciencia de datos", "fr": "Statistiques et data science", "de": "Statistik und Data Science", "pt": "Estatística e ciência de dados"}, "has_full_content": False, "order": 16},
    {"id": "bash", "name": "Bash", "icon_family": "MaterialCommunityIcons", "icon_name": "bash", "color": "#1E293B", "tagline": {"it": "Automazione e shell scripting", "en": "Automation and shell scripting", "es": "Automatización y shell scripting", "fr": "Automatisation et shell scripting", "de": "Automatisierung und Shell-Scripting", "pt": "Automação e shell scripting"}, "has_full_content": False, "order": 17},
]

LEVELS = ["base", "intermediate", "advanced", "pro"]

LEVEL_TITLES = {
    "base": {"it": "Base", "en": "Beginner", "es": "Básico", "fr": "Débutant", "de": "Grundlagen", "pt": "Básico"},
    "intermediate": {"it": "Intermedio", "en": "Intermediate", "es": "Intermedio", "fr": "Intermédiaire", "de": "Fortgeschritten", "pt": "Intermediário"},
    "advanced": {"it": "Avanzato", "en": "Advanced", "es": "Avanzado", "fr": "Avancé", "de": "Profi", "pt": "Avançado"},
    "pro": {"it": "Pro", "en": "Pro", "es": "Pro", "fr": "Pro", "de": "Pro", "pt": "Pro"},
}


def _ml(it, en, es=None, fr=None, de=None, pt=None):
    """Helper: build multilingual dict; if not provided, falls back to EN."""
    return {"it": it, "en": en, "es": es or en, "fr": fr or en, "de": de or en, "pt": pt or en}


# ============================================================================
# PYTHON CONTENT (full)
# ============================================================================
PYTHON_LESSONS = {
    "base": [
        {
            "title": _ml("Introduzione a Python", "Introduction to Python", "Introducción a Python", "Introduction à Python", "Einführung in Python", "Introdução ao Python"),
            "content": _ml(
                "Python è un linguaggio di programmazione semplice, leggibile e potente. Viene usato per sviluppo web, AI, data science, automazione e molto altro. La sintassi pulita lo rende ideale per i principianti.",
                "Python is a simple, readable and powerful programming language. It's used for web development, AI, data science, automation and much more. Its clean syntax makes it ideal for beginners.",
                "Python es un lenguaje de programación simple, legible y potente. Se usa para desarrollo web, IA, ciencia de datos, automatización y mucho más.",
                "Python est un langage de programmation simple, lisible et puissant. Il est utilisé pour le développement web, l'IA, la data science, l'automatisation et bien plus.",
                "Python ist eine einfache, lesbare und leistungsstarke Programmiersprache. Sie wird für Webentwicklung, KI, Data Science, Automatisierung und mehr verwendet.",
                "Python é uma linguagem de programação simples, legível e poderosa. É usada para desenvolvimento web, IA, ciência de dados e automação.",
            ),
            "code": 'print("Hello, World!")',
            "code_explanation": _ml("La funzione print() stampa testo a schermo.", "The print() function outputs text to the screen.", "La función print() muestra texto en pantalla.", "La fonction print() affiche du texte à l'écran.", "Die print()-Funktion gibt Text aus.", "A função print() exibe texto na tela."),
        },
        {
            "title": _ml("Variabili e tipi di dato", "Variables and data types", "Variables y tipos de datos", "Variables et types de données", "Variablen und Datentypen", "Variáveis e tipos de dados"),
            "content": _ml(
                "Le variabili memorizzano valori. In Python non devi dichiararne il tipo: viene dedotto automaticamente. I tipi principali sono: int (numeri interi), float (decimali), str (stringhe), bool (True/False).",
                "Variables store values. In Python you don't need to declare their type: it's inferred automatically. Main types: int, float, str, bool.",
                "Las variables almacenan valores. En Python no declaras su tipo: se deduce. Tipos: int, float, str, bool.",
                "Les variables stockent des valeurs. En Python, le type est déduit automatiquement. Types: int, float, str, bool.",
                "Variablen speichern Werte. In Python wird der Typ automatisch abgeleitet. Typen: int, float, str, bool.",
                "Variáveis armazenam valores. Em Python o tipo é inferido. Tipos: int, float, str, bool.",
            ),
            "code": 'name = "Alice"\nage = 25\nheight = 1.70\nis_student = True\nprint(name, age, height, is_student)',
            "code_explanation": _ml("Quattro variabili di tipi diversi.", "Four variables of different types.", "Cuatro variables de tipos distintos.", "Quatre variables de types différents.", "Vier Variablen verschiedener Typen.", "Quatro variáveis de tipos diferentes."),
        },
        {
            "title": _ml("Operatori e calcoli", "Operators and calculations", "Operadores y cálculos", "Opérateurs et calculs", "Operatoren und Berechnungen", "Operadores e cálculos"),
            "content": _ml(
                "Python supporta tutti gli operatori matematici: + - * / // (divisione intera) ** (potenza) % (modulo). Gli operatori di confronto restituiscono booleani.",
                "Python supports all math operators: + - * / // ** %. Comparison operators return booleans.",
                "Python soporta todos los operadores matemáticos. Los operadores de comparación devuelven booleanos.",
                "Python supporte tous les opérateurs mathématiques. Les opérateurs de comparaison retournent des booléens.",
                "Python unterstützt alle mathematischen Operatoren. Vergleichsoperatoren geben Boolesche Werte zurück.",
                "Python suporta todos os operadores matemáticos. Operadores de comparação retornam booleanos.",
            ),
            "code": "a = 10\nb = 3\nprint(a + b)\nprint(a // b)\nprint(a ** b)\nprint(a > b)",
            "code_explanation": _ml("Output: 13, 3, 1000, True", "Output: 13, 3, 1000, True", "Salida: 13, 3, 1000, True", "Sortie: 13, 3, 1000, True", "Ausgabe: 13, 3, 1000, True", "Saída: 13, 3, 1000, True"),
        },
        {
            "title": _ml("Condizioni if/else", "if/else conditions", "Condiciones if/else", "Conditions if/else", "if/else-Bedingungen", "Condições if/else"),
            "content": _ml(
                "Le condizioni permettono di eseguire codice diverso in base a valori. La sintassi richiede i due punti (:) e l'indentazione.",
                "Conditions let you run different code based on values. Syntax requires colon (:) and indentation.",
                "Las condiciones ejecutan código distinto según valores. Requiere dos puntos e indentación.",
                "Les conditions exécutent du code différent. Nécessite deux-points et indentation.",
                "Bedingungen führen unterschiedlichen Code aus. Erfordert Doppelpunkt und Einrückung.",
                "Condições executam código diferente. Requer dois pontos e indentação.",
            ),
            "code": "age = 18\nif age >= 18:\n    print(\"Adulto\")\nelse:\n    print(\"Minorenne\")",
            "code_explanation": _ml("Stampa 'Adulto' perché age=18.", "Prints 'Adulto' because age=18.", "Imprime 'Adulto'.", "Affiche 'Adulto'.", "Druckt 'Adulto'.", "Imprime 'Adulto'."),
        },
        {
            "title": _ml("Cicli for e while", "for and while loops", "Bucles for y while", "Boucles for et while", "for- und while-Schleifen", "Loops for e while"),
            "content": _ml(
                "I cicli ripetono blocchi di codice. for itera su sequenze, while continua finché una condizione è vera.",
                "Loops repeat code blocks. 'for' iterates over sequences, 'while' runs while a condition is true.",
                "Los bucles repiten código. for itera secuencias, while mientras una condición sea verdadera.",
                "Les boucles répètent du code. for itère, while tant que la condition est vraie.",
                "Schleifen wiederholen Code. for iteriert, while solange eine Bedingung wahr ist.",
                "Loops repetem código. for itera, while enquanto verdadeiro.",
            ),
            "code": "for i in range(5):\n    print(i)\n\nn = 0\nwhile n < 3:\n    print(\"ciao\")\n    n += 1",
            "code_explanation": _ml("Stampa 0..4 e poi 'ciao' tre volte.", "Prints 0..4 then 'ciao' three times.", "Imprime 0..4 y luego 'ciao' tres veces.", "Affiche 0..4 puis 'ciao' trois fois.", "Druckt 0..4, dann 'ciao' dreimal.", "Imprime 0..4 e 'ciao' três vezes."),
        },
    ],
    "intermediate": [
        {
            "title": _ml("Funzioni", "Functions", "Funciones", "Fonctions", "Funktionen", "Funções"),
            "content": _ml("Le funzioni raggruppano codice riutilizzabile. Si definiscono con def.", "Functions group reusable code. Defined with def.", "Las funciones agrupan código reutilizable.", "Les fonctions regroupent du code réutilisable.", "Funktionen bündeln wiederverwendbaren Code.", "Funções agrupam código reutilizável."),
            "code": "def saluta(nome):\n    return f\"Ciao {nome}!\"\n\nprint(saluta(\"Alice\"))",
            "code_explanation": _ml("Funzione con parametro e return.", "Function with parameter and return.", "Función con parámetro y return.", "Fonction avec paramètre et return.", "Funktion mit Parameter und Rückgabe.", "Função com parâmetro e return."),
        },
        {
            "title": _ml("Liste e dizionari", "Lists and dictionaries", "Listas y diccionarios", "Listes et dictionnaires", "Listen und Dictionaries", "Listas e dicionários"),
            "content": _ml("Le liste sono sequenze ordinate. I dizionari memorizzano coppie chiave-valore.", "Lists are ordered sequences. Dicts store key-value pairs.", "Listas son secuencias. Diccionarios almacenan pares clave-valor.", "Les listes sont des séquences. Les dicts stockent des paires.", "Listen sind Sequenzen. Dicts speichern Schlüssel-Wert-Paare.", "Listas são sequências. Dicionários guardam pares chave-valor."),
            "code": "frutti = [\"mela\", \"pera\", \"uva\"]\nfrutti.append(\"banana\")\nutente = {\"nome\": \"Alice\", \"eta\": 25}\nprint(frutti, utente[\"nome\"])",
            "code_explanation": _ml("Aggiungi a lista, leggi da dizionario.", "Append to list, read from dict.", "Agregar a lista, leer de dict.", "Ajouter à la liste, lire du dict.", "Zu Liste hinzufügen, aus Dict lesen.", "Adicionar à lista, ler do dict."),
        },
        {
            "title": _ml("Gestione errori try/except", "Error handling try/except", "Manejo de errores try/except", "Gestion d'erreurs try/except", "Fehlerbehandlung try/except", "Tratamento de erros try/except"),
            "content": _ml("try/except gestisce gli errori senza far crashare il programma.", "try/except handles errors gracefully.", "try/except maneja errores sin romper el programa.", "try/except gère les erreurs.", "try/except behandelt Fehler.", "try/except trata erros."),
            "code": "try:\n    x = int(\"abc\")\nexcept ValueError as e:\n    print(\"Errore:\", e)",
            "code_explanation": _ml("Cattura ValueError quando int() fallisce.", "Catches ValueError when int() fails.", "Captura ValueError.", "Capture ValueError.", "Fängt ValueError ab.", "Captura ValueError."),
        },
    ],
    "advanced": [
        {
            "title": _ml("Programmazione orientata agli oggetti", "Object-oriented programming", "POO", "POO", "OOP", "POO"),
            "content": _ml("Le classi definiscono oggetti con attributi e metodi.", "Classes define objects with attributes and methods.", "Las clases definen objetos.", "Les classes définissent des objets.", "Klassen definieren Objekte.", "Classes definem objetos."),
            "code": "class Persona:\n    def __init__(self, nome):\n        self.nome = nome\n    def saluta(self):\n        return f\"Sono {self.nome}\"\n\np = Persona(\"Alice\")\nprint(p.saluta())",
            "code_explanation": _ml("Classe con costruttore e metodo.", "Class with constructor and method.", "Clase con constructor y método.", "Classe avec constructeur et méthode.", "Klasse mit Konstruktor und Methode.", "Classe com construtor e método."),
        },
        {
            "title": _ml("Decoratori", "Decorators", "Decoradores", "Décorateurs", "Dekoratoren", "Decoradores"),
            "content": _ml("I decoratori modificano il comportamento di funzioni.", "Decorators modify function behavior.", "Decoradores modifican funciones.", "Les décorateurs modifient les fonctions.", "Dekoratoren ändern Funktionen.", "Decoradores modificam funções."),
            "code": "def log(fn):\n    def wrapper(*a, **k):\n        print(\"Chiamata:\", fn.__name__)\n        return fn(*a, **k)\n    return wrapper\n\n@log\ndef somma(a,b):\n    return a+b\n\nprint(somma(2,3))",
            "code_explanation": _ml("Decoratore @log stampa il nome.", "Decorator @log prints the name.", "Decorador @log imprime el nombre.", "Le décorateur @log affiche le nom.", "Der Dekorator @log druckt den Namen.", "Decorador @log imprime o nome."),
        },
    ],
    "pro": [
        {
            "title": _ml("Async e concorrenza", "Async and concurrency", "Async y concurrencia", "Async et concurrence", "Async und Nebenläufigkeit", "Async e concorrência"),
            "content": _ml("asyncio permette codice non bloccante.", "asyncio enables non-blocking code.", "asyncio para código no bloqueante.", "asyncio pour du code non bloquant.", "asyncio für nicht-blockierenden Code.", "asyncio para código não bloqueante."),
            "code": "import asyncio\n\nasync def main():\n    await asyncio.sleep(1)\n    print(\"Fatto!\")\n\nasyncio.run(main())",
            "code_explanation": _ml("Funzione asincrona con await.", "Async function with await.", "Función asíncrona.", "Fonction asynchrone.", "Asynchrone Funktion.", "Função assíncrona."),
        },
    ],
}

PYTHON_QUIZZES = {
    "base": [
        {"question": _ml("Quale funzione stampa a schermo in Python?", "Which function prints to screen in Python?", "¿Qué función imprime en pantalla?", "Quelle fonction affiche à l'écran?", "Welche Funktion gibt aus?", "Qual função imprime na tela?"), "options": [_ml("echo()", "echo()"), _ml("print()", "print()"), _ml("printf()", "printf()"), _ml("write()", "write()")], "correct_index": 1, "explanation": _ml("In Python si usa print().", "In Python you use print().", "En Python se usa print().", "En Python on utilise print().", "In Python verwendet man print().", "Em Python usa-se print().")},
        {"question": _ml("Cosa restituisce 10 // 3?", "What does 10 // 3 return?", "¿Qué devuelve 10 // 3?", "Que retourne 10 // 3?", "Was gibt 10 // 3 zurück?", "O que 10 // 3 retorna?"), "options": [_ml("3.33", "3.33"), _ml("3", "3"), _ml("4", "4"), _ml("Errore", "Error")], "correct_index": 1, "explanation": _ml("// è la divisione intera.", "// is integer division.", "// es división entera.", "// est la division entière.", "// ist Ganzzahldivision.", "// é divisão inteira.")},
        {"question": _ml("Quale è il tipo di True?", "What is the type of True?", "¿Qué tipo es True?", "Quel est le type de True?", "Welcher Typ ist True?", "Qual é o tipo de True?"), "options": [_ml("int", "int"), _ml("str", "str"), _ml("bool", "bool"), _ml("float", "float")], "correct_index": 2, "explanation": _ml("True è un booleano.", "True is a boolean.", "True es booleano.", "True est un booléen.", "True ist ein Boolean.", "True é um booleano.")},
        {"question": _ml("Cosa stampa range(3)?", "What does range(3) iterate over?", "¿Qué itera range(3)?", "Sur quoi itère range(3)?", "Worüber iteriert range(3)?", "Sobre o que range(3) itera?"), "options": [_ml("1,2,3", "1,2,3"), _ml("0,1,2", "0,1,2"), _ml("0,1,2,3", "0,1,2,3"), _ml("3", "3")], "correct_index": 1, "explanation": _ml("range(n) genera 0..n-1.", "range(n) yields 0..n-1.", "range(n) genera 0..n-1.", "range(n) génère 0..n-1.", "range(n) erzeugt 0..n-1.", "range(n) gera 0..n-1.")},
    ],
    "intermediate": [
        {"question": _ml("Come definisci una funzione?", "How do you define a function?", "¿Cómo defines una función?", "Comment définir une fonction?", "Wie definiert man eine Funktion?", "Como definir uma função?"), "options": [_ml("function f():", "function f():"), _ml("def f():", "def f():"), _ml("func f():", "func f():"), _ml("fn f():", "fn f():")], "correct_index": 1, "explanation": _ml("Si usa la keyword def.", "Use keyword def.", "Se usa def.", "On utilise def.", "Man verwendet def.", "Usa-se def.")},
        {"question": _ml("Come accedi al valore 'a' nel dict d={'a':1}?", "How do you access value 'a' in d={'a':1}?", "¿Cómo accedes a 'a' en d={'a':1}?", "Comment accéder à 'a' dans d={'a':1}?", "Wie greift man auf 'a' in d={'a':1} zu?", "Como acessar 'a' em d={'a':1}?"), "options": [_ml("d.a", "d.a"), _ml("d['a']", "d['a']"), _ml("d->a", "d->a"), _ml("d::a", "d::a")], "correct_index": 1, "explanation": _ml("Si usa la sintassi a parentesi quadre.", "Bracket notation.", "Notación de corchetes.", "Notation à crochets.", "Klammernotation.", "Notação de colchetes.")},
    ],
    "advanced": [
        {"question": _ml("Cosa fa __init__ in una classe?", "What does __init__ do?", "¿Qué hace __init__?", "Que fait __init__?", "Was macht __init__?", "O que __init__ faz?"), "options": [_ml("Distrugge l'oggetto", "Destroys the object"), _ml("Inizializza l'istanza", "Initializes the instance"), _ml("Stampa l'oggetto", "Prints the object"), _ml("Niente", "Nothing")], "correct_index": 1, "explanation": _ml("È il costruttore.", "It's the constructor.", "Es el constructor.", "C'est le constructeur.", "Es ist der Konstruktor.", "É o construtor.")},
    ],
    "pro": [
        {"question": _ml("Quale keyword definisce una funzione asincrona?", "Which keyword defines an async function?", "¿Qué keyword define función asíncrona?", "Quel mot-clé pour async?", "Welches Schlüsselwort für async?", "Qual keyword define função assíncrona?"), "options": [_ml("def", "def"), _ml("async def", "async def"), _ml("await", "await"), _ml("future", "future")], "correct_index": 1, "explanation": _ml("async def crea coroutine.", "async def creates coroutines.", "async def crea corrutinas.", "async def crée des coroutines.", "async def erzeugt Koroutinen.", "async def cria corrotinas.")},
    ],
}

PYTHON_EXERCISES = {
    "base": [
        {"title": _ml("Completa: stampa Hello", "Complete: print Hello", "Completa: imprime Hello", "Complète: affiche Hello", "Vervollständige: druckt Hello", "Complete: imprime Hello"), "instructions": _ml("Completa il codice per stampare 'Hello CodeMaster'.", "Complete the code to print 'Hello CodeMaster'.", "Completa para imprimir 'Hello CodeMaster'.", "Complète pour afficher 'Hello CodeMaster'.", "Vervollständige zum Drucken.", "Complete para imprimir."), "starter_code": "____(\"Hello CodeMaster\")", "solution": "print(\"Hello CodeMaster\")", "expected_output": "Hello CodeMaster"},
        {"title": _ml("Somma due numeri", "Sum two numbers", "Suma dos números", "Somme deux nombres", "Summe zweier Zahlen", "Soma dois números"), "instructions": _ml("Stampa la somma di a e b.", "Print sum of a and b.", "Imprime la suma.", "Affiche la somme.", "Druckt die Summe.", "Imprime a soma."), "starter_code": "a = 5\nb = 3\nprint(____)", "solution": "a = 5\nb = 3\nprint(a + b)", "expected_output": "8"},
    ],
    "intermediate": [
        {"title": _ml("Funzione raddoppia", "Double function", "Función doblar", "Fonction double", "Verdopplungsfunktion", "Função dobrar"), "instructions": _ml("Definisci una funzione raddoppia(n) che restituisce n*2.", "Define raddoppia(n) returning n*2.", "Define raddoppia(n) que devuelve n*2.", "Définis raddoppia(n) qui retourne n*2.", "Definiere raddoppia(n) → n*2.", "Defina raddoppia(n) que retorna n*2."), "starter_code": "def raddoppia(n):\n    return ____\n\nprint(raddoppia(5))", "solution": "def raddoppia(n):\n    return n * 2\n\nprint(raddoppia(5))", "expected_output": "10"},
    ],
    "advanced": [
        {"title": _ml("Crea classe Animale", "Create Animal class", "Crear clase Animal", "Créer classe Animal", "Animal-Klasse erstellen", "Criar classe Animal"), "instructions": _ml("Crea classe Animale con metodo verso() che restituisce 'Bau'.", "Create Animal class with verso() returning 'Bau'.", "Crea Animal con verso() devolviendo 'Bau'.", "Crée classe Animal avec verso() retournant 'Bau'.", "Erstelle Animal mit verso() das 'Bau' zurückgibt.", "Crie Animal com verso() retornando 'Bau'."), "starter_code": "class Animale:\n    def verso(self):\n        return ____\n\nprint(Animale().verso())", "solution": "class Animale:\n    def verso(self):\n        return 'Bau'\n\nprint(Animale().verso())", "expected_output": "Bau"},
    ],
    "pro": [
        {"title": _ml("Async sleep", "Async sleep", "Async sleep", "Async sleep", "Async Sleep", "Async sleep"), "instructions": _ml("Completa la funzione async che dorme 1s.", "Complete async function sleeping 1s.", "Completa función async durmiendo 1s.", "Complète fonction async qui dort 1s.", "Vervollständige async-Funktion mit 1s Schlaf.", "Complete função async dormindo 1s."), "starter_code": "import asyncio\n\nasync def main():\n    ____ asyncio.sleep(1)\n    print('done')\n\nasyncio.run(main())", "solution": "import asyncio\n\nasync def main():\n    await asyncio.sleep(1)\n    print('done')\n\nasyncio.run(main())", "expected_output": "done"},
    ],
}

# ============================================================================
# JAVASCRIPT CONTENT (full)
# ============================================================================
JS_LESSONS = {
    "base": [
        {"title": _ml("Introduzione a JavaScript", "Introduction to JavaScript", "Introducción a JavaScript", "Introduction à JavaScript", "Einführung in JavaScript", "Introdução ao JavaScript"), "content": _ml("JavaScript è il linguaggio del web. Gira nei browser e con Node.js anche sul server.", "JavaScript is the web's language. Runs in browsers and on the server with Node.js.", "JavaScript es el lenguaje de la web.", "JavaScript est le langage du web.", "JavaScript ist die Sprache des Webs.", "JavaScript é a linguagem da web."), "code": "console.log('Hello, World!');", "code_explanation": _ml("console.log stampa nel terminale/console.", "console.log prints to console.", "console.log imprime en consola.", "console.log affiche dans la console.", "console.log gibt in der Konsole aus.", "console.log imprime no console.")},
        {"title": _ml("Variabili: let, const, var", "Variables: let, const, var", "Variables: let, const, var", "Variables: let, const, var", "Variablen: let, const, var", "Variáveis: let, const, var"), "content": _ml("Usa const per costanti, let per variabili che cambiano. var è obsoleto.", "Use const for constants, let for variables. var is obsolete.", "Usa const para constantes, let para variables.", "Utilise const pour constantes, let pour variables.", "Verwende const für Konstanten, let für Variablen.", "Use const para constantes, let para variáveis."), "code": "const PI = 3.14;\nlet name = 'Alice';\nname = 'Bob';\nconsole.log(PI, name);", "code_explanation": _ml("PI immutabile, name modificabile.", "PI is immutable, name mutable.", "PI inmutable.", "PI immuable.", "PI ist unveränderlich.", "PI imutável.")},
        {"title": _ml("Funzioni e arrow", "Functions and arrows", "Funciones y arrow", "Fonctions et arrow", "Funktionen und Arrow", "Funções e arrow"), "content": _ml("Le funzioni si dichiarano con function o con freccia (=>).", "Functions can be declared with 'function' or arrow (=>).", "Las funciones con function o flecha.", "Fonctions avec function ou flèche.", "Funktionen mit function oder Pfeil.", "Funções com function ou seta."), "code": "function somma(a, b) {\n  return a + b;\n}\nconst doppio = (n) => n * 2;\nconsole.log(somma(2,3), doppio(5));", "code_explanation": _ml("Stampa 5 e 10.", "Prints 5 and 10.", "Imprime 5 y 10.", "Affiche 5 et 10.", "Druckt 5 und 10.", "Imprime 5 e 10.")},
        {"title": _ml("Array e oggetti", "Arrays and objects", "Arrays y objetos", "Tableaux et objets", "Arrays und Objekte", "Arrays e objetos"), "content": _ml("Gli array contengono liste. Gli oggetti coppie chiave-valore.", "Arrays hold lists. Objects hold key-value pairs.", "Arrays son listas. Objetos son pares.", "Les tableaux sont des listes. Les objets, des paires.", "Arrays sind Listen. Objekte sind Schlüssel-Wert-Paare.", "Arrays são listas. Objetos são pares."), "code": "const frutti = ['mela', 'pera'];\nfrutti.push('uva');\nconst utente = { nome: 'Alice', eta: 25 };\nconsole.log(frutti, utente.nome);", "code_explanation": _ml("Aggiungi a array, accedi a oggetto.", "Push to array, access object.", "Push y acceso.", "Push et accès.", "Push und Zugriff.", "Push e acesso.")},
        {"title": _ml("Condizioni e cicli", "Conditions and loops", "Condiciones y bucles", "Conditions et boucles", "Bedingungen und Schleifen", "Condições e loops"), "content": _ml("if/else e cicli for/while come in Python ma con sintassi a parentesi.", "if/else and for/while loops with bracket syntax.", "if/else y bucles con llaves.", "if/else et boucles avec accolades.", "if/else und Schleifen mit Klammern.", "if/else e loops com chaves."), "code": "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}", "code_explanation": _ml("Stampa 0, 1, 2.", "Prints 0, 1, 2.", "Imprime 0, 1, 2.", "Affiche 0, 1, 2.", "Druckt 0, 1, 2.", "Imprime 0, 1, 2.")},
    ],
    "intermediate": [
        {"title": _ml("Promise e async/await", "Promises and async/await", "Promises y async/await", "Promesses et async/await", "Promises und async/await", "Promises e async/await"), "content": _ml("async/await semplifica codice asincrono.", "async/await simplifies async code.", "async/await simplifica código async.", "async/await simplifie le code async.", "async/await vereinfacht asynchronen Code.", "async/await simplifica código async."), "code": "async function fetchUser() {\n  const res = await fetch('/api/user');\n  return res.json();\n}", "code_explanation": _ml("await attende la promise.", "await waits for promise.", "await espera promesa.", "await attend la promesse.", "await wartet auf Promise.", "await aguarda promise.")},
        {"title": _ml("Map, filter, reduce", "Map, filter, reduce", "Map, filter, reduce", "Map, filter, reduce", "Map, filter, reduce", "Map, filter, reduce"), "content": _ml("Metodi funzionali per array.", "Functional array methods.", "Métodos funcionales.", "Méthodes fonctionnelles.", "Funktionale Array-Methoden.", "Métodos funcionais."), "code": "const nums = [1,2,3,4];\nconst doppi = nums.map(n => n*2);\nconst pari = nums.filter(n => n%2===0);\nconst sum = nums.reduce((a,b)=>a+b, 0);\nconsole.log(doppi, pari, sum);", "code_explanation": _ml("Tre operazioni funzionali.", "Three functional ops.", "Tres operaciones.", "Trois opérations.", "Drei Operationen.", "Três operações.")},
    ],
    "advanced": [
        {"title": _ml("Closure e scope", "Closures and scope", "Closures y scope", "Closures et portée", "Closures und Scope", "Closures e escopo"), "content": _ml("Una closure è una funzione che ricorda lo scope in cui è stata creata.", "A closure remembers its creation scope.", "Closure recuerda su scope.", "Une closure mémorise sa portée.", "Closure merkt sich Scope.", "Closure lembra do escopo."), "code": "function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst c = counter();\nconsole.log(c(), c(), c());", "code_explanation": _ml("Stampa 1 2 3.", "Prints 1 2 3.", "Imprime 1 2 3.", "Affiche 1 2 3.", "Druckt 1 2 3.", "Imprime 1 2 3.")},
    ],
    "pro": [
        {"title": _ml("Web API e fetch", "Web APIs and fetch", "API Web y fetch", "API Web et fetch", "Web-APIs und fetch", "Web APIs e fetch"), "content": _ml("fetch() effettua chiamate HTTP nel browser.", "fetch() makes HTTP calls in the browser.", "fetch() hace llamadas HTTP.", "fetch() fait des appels HTTP.", "fetch() macht HTTP-Aufrufe.", "fetch() faz chamadas HTTP."), "code": "const data = await fetch('https://api.example.com').then(r => r.json());\nconsole.log(data);", "code_explanation": _ml("Recupera JSON da API.", "Fetch JSON from API.", "Obtiene JSON.", "Récupère JSON.", "Holt JSON.", "Busca JSON.")},
    ],
}

JS_QUIZZES = {
    "base": [
        {"question": _ml("Come dichiari una costante?", "How do you declare a constant?", "¿Cómo declaras constante?", "Comment déclarer une constante?", "Wie deklariert man eine Konstante?", "Como declarar constante?"), "options": [_ml("var", "var"), _ml("let", "let"), _ml("const", "const"), _ml("final", "final")], "correct_index": 2, "explanation": _ml("const è per valori immutabili.", "const is for immutable values.", "const para inmutables.", "const pour immuables.", "const für unveränderlich.", "const para imutáveis.")},
        {"question": _ml("console.log stampa dove?", "Where does console.log print?", "¿Dónde imprime console.log?", "Où affiche console.log?", "Wo gibt console.log aus?", "Onde console.log imprime?"), "options": [_ml("Browser console", "Browser console"), _ml("File HTML", "HTML file"), _ml("Database", "Database"), _ml("Stampante", "Printer")], "correct_index": 0, "explanation": _ml("Stampa nella console.", "Prints to console.", "En consola.", "Dans la console.", "In der Konsole.", "No console.")},
        {"question": _ml("Quale crea funzione freccia?", "Which creates an arrow function?", "¿Cuál crea arrow function?", "Quelle crée une arrow?", "Welche erzeugt Arrow?", "Qual cria arrow function?"), "options": [_ml("function ()", "function ()"), _ml("=>", "=>"), _ml("->", "->"), _ml("def", "def")], "correct_index": 1, "explanation": _ml("La freccia => definisce arrow function.", "Arrow => defines arrow functions.", "Flecha =>.", "Flèche =>.", "Pfeil =>.", "Seta =>.")},
        {"question": _ml("typeof [] in JS è?", "typeof [] in JS is?", "¿typeof [] es?", "typeof [] est?", "typeof [] ist?", "typeof [] é?"), "options": [_ml("'array'", "'array'"), _ml("'object'", "'object'"), _ml("'list'", "'list'"), _ml("'undefined'", "'undefined'")], "correct_index": 1, "explanation": _ml("Gli array sono oggetti.", "Arrays are objects.", "Arrays son objetos.", "Tableaux sont des objets.", "Arrays sind Objekte.", "Arrays são objetos.")},
    ],
    "intermediate": [
        {"question": _ml("Cosa fa await?", "What does await do?", "¿Qué hace await?", "Que fait await?", "Was macht await?", "O que await faz?"), "options": [_ml("Crea una promise", "Creates a promise"), _ml("Aspetta la promise", "Waits for promise"), _ml("Crea variabile", "Creates variable"), _ml("Niente", "Nothing")], "correct_index": 1, "explanation": _ml("await sospende l'esecuzione.", "await suspends execution.", "await suspende.", "await suspend.", "await pausiert.", "await suspende.")},
    ],
    "advanced": [
        {"question": _ml("Una closure è...", "A closure is...", "Una closure es...", "Une closure est...", "Eine Closure ist...", "Uma closure é..."), "options": [_ml("Una variabile globale", "A global var"), _ml("Funzione che ricorda lo scope", "Function remembering scope"), _ml("Loop infinito", "Infinite loop"), _ml("Errore", "Error")], "correct_index": 1, "explanation": _ml("Ricorda lo scope esterno.", "Remembers outer scope.", "Recuerda scope externo.", "Mémorise la portée.", "Merkt sich äußeren Scope.", "Lembra escopo externo.")},
    ],
    "pro": [
        {"question": _ml("fetch restituisce?", "fetch returns?", "fetch devuelve?", "fetch retourne?", "fetch gibt zurück?", "fetch retorna?"), "options": [_ml("Stringa", "String"), _ml("Promise", "Promise"), _ml("Array", "Array"), _ml("Numero", "Number")], "correct_index": 1, "explanation": _ml("fetch è asincrono.", "fetch is async.", "fetch es async.", "fetch est async.", "fetch ist async.", "fetch é async.")},
    ],
}

JS_EXERCISES = {
    "base": [
        {"title": _ml("Dichiara const", "Declare const", "Declara const", "Déclare const", "const deklarieren", "Declare const"), "instructions": _ml("Dichiara una costante PI con valore 3.14.", "Declare const PI = 3.14.", "Declara const PI = 3.14.", "Déclare const PI = 3.14.", "Deklariere const PI = 3.14.", "Declare const PI = 3.14."), "starter_code": "____ PI = 3.14;\nconsole.log(PI);", "solution": "const PI = 3.14;\nconsole.log(PI);", "expected_output": "3.14"},
        {"title": _ml("Funzione freccia", "Arrow function", "Arrow", "Arrow", "Arrow", "Arrow"), "instructions": _ml("Crea arrow doppio(n) che restituisce n*2.", "Create arrow doppio(n) returning n*2.", "Crea arrow doppio(n).", "Crée arrow doppio(n).", "Erstelle arrow doppio(n).", "Crie arrow doppio(n)."), "starter_code": "const doppio = (n) => ____;\nconsole.log(doppio(5));", "solution": "const doppio = (n) => n * 2;\nconsole.log(doppio(5));", "expected_output": "10"},
    ],
    "intermediate": [
        {"title": _ml("Map raddoppia", "Map double", "Map doblar", "Map double", "Map verdoppeln", "Map dobrar"), "instructions": _ml("Usa map per raddoppiare ogni elemento.", "Use map to double each element.", "Usa map para doblar.", "Utilise map.", "Verwende map.", "Use map."), "starter_code": "const nums = [1,2,3];\nconst doppi = nums.map(n => ____);\nconsole.log(doppi);", "solution": "const nums = [1,2,3];\nconst doppi = nums.map(n => n*2);\nconsole.log(doppi);", "expected_output": "[2,4,6]"},
    ],
    "advanced": [
        {"title": _ml("Closure counter", "Closure counter", "Closure counter", "Closure counter", "Closure-Zähler", "Closure counter"), "instructions": _ml("Crea closure counter che incrementa.", "Create counter closure.", "Crea closure counter.", "Crée closure counter.", "Erstelle Closure counter.", "Crie closure counter."), "starter_code": "function counter() {\n  let n = 0;\n  return () => ____;\n}\nconst c = counter();\nconsole.log(c());", "solution": "function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst c = counter();\nconsole.log(c());", "expected_output": "1"},
    ],
    "pro": [
        {"title": _ml("Fetch API", "Fetch API", "Fetch API", "Fetch API", "Fetch API", "Fetch API"), "instructions": _ml("Completa la chiamata fetch.", "Complete fetch call.", "Completa fetch.", "Complète fetch.", "Vervollständige fetch.", "Complete fetch."), "starter_code": "const data = ____ fetch('/api/user').then(r=>r.json());\nconsole.log(data);", "solution": "const data = await fetch('/api/user').then(r=>r.json());\nconsole.log(data);", "expected_output": "Object"},
    ],
}

# ============================================================================
# HTML/CSS CONTENT (full)
# ============================================================================
HTML_LESSONS = {
    "base": [
        {"title": _ml("Cos'è HTML", "What is HTML", "Qué es HTML", "Qu'est-ce que HTML", "Was ist HTML", "O que é HTML"), "content": _ml("HTML (HyperText Markup Language) struttura il contenuto delle pagine web tramite tag.", "HTML structures web page content using tags.", "HTML estructura el contenido web.", "HTML structure le contenu web.", "HTML strukturiert Webinhalte.", "HTML estrutura conteúdo web."), "code": "<!DOCTYPE html>\n<html>\n<head><title>Mio sito</title></head>\n<body>\n  <h1>Benvenuto</h1>\n  <p>Prima pagina HTML.</p>\n</body>\n</html>", "code_explanation": _ml("Struttura base di un documento HTML.", "Basic HTML document structure.", "Estructura básica.", "Structure de base.", "Grundstruktur.", "Estrutura básica.")},
        {"title": _ml("Tag comuni", "Common tags", "Tags comunes", "Balises courantes", "Häufige Tags", "Tags comuns"), "content": _ml("h1-h6 per titoli, p per paragrafi, a per link, img per immagini, ul/li per liste.", "h1-h6 for headings, p for paragraphs, a for links, img for images, ul/li for lists.", "h1-h6 títulos, p párrafos, a enlaces.", "h1-h6 titres, p paragraphes.", "h1-h6 Überschriften.", "h1-h6 títulos."), "code": "<h2>Sottotitolo</h2>\n<p>Paragrafo con <a href=\"https://example.com\">link</a>.</p>\n<ul>\n  <li>Uno</li>\n  <li>Due</li>\n</ul>", "code_explanation": _ml("Diversi tag in azione.", "Various tags in action.", "Varios tags.", "Diverses balises.", "Verschiedene Tags.", "Vários tags.")},
        {"title": _ml("Introduzione a CSS", "Introduction to CSS", "Introducción a CSS", "Introduction à CSS", "Einführung in CSS", "Introdução ao CSS"), "content": _ml("CSS controlla l'aspetto della pagina: colori, font, layout.", "CSS controls page appearance: colors, fonts, layout.", "CSS controla el aspecto.", "CSS contrôle l'apparence.", "CSS steuert das Aussehen.", "CSS controla a aparência."), "code": "h1 {\n  color: #3B82F6;\n  font-size: 32px;\n  text-align: center;\n}", "code_explanation": _ml("Selettore h1 con tre proprietà.", "h1 selector with three props.", "Selector con propiedades.", "Sélecteur avec propriétés.", "Selektor mit Eigenschaften.", "Seletor com propriedades.")},
        {"title": _ml("Selettori CSS", "CSS selectors", "Selectores CSS", "Sélecteurs CSS", "CSS-Selektoren", "Seletores CSS"), "content": _ml(".classe per classi, #id per id, tag per elementi.", ".class for classes, #id for ids, tag for elements.", ".clase, #id, tag.", ".classe, #id, balise.", ".klasse, #id, tag.", ".classe, #id, tag."), "code": ".bottone {\n  background: #8B5CF6;\n  color: white;\n  padding: 12px 24px;\n  border-radius: 8px;\n}", "code_explanation": _ml("Stile per classe .bottone.", "Style for .bottone class.", "Estilo para clase.", "Style pour classe.", "Stil für Klasse.", "Estilo para classe.")},
        {"title": _ml("Box model", "Box model", "Modelo de caja", "Modèle de boîte", "Box-Modell", "Modelo de caixa"), "content": _ml("Ogni elemento ha content, padding, border, margin.", "Every element has content, padding, border, margin.", "content, padding, border, margin.", "content, padding, border, margin.", "content, padding, border, margin.", "content, padding, border, margin."), "code": ".card {\n  padding: 16px;\n  margin: 8px;\n  border: 2px solid #E2E8F0;\n  border-radius: 16px;\n}", "code_explanation": _ml("Card con box model completo.", "Card with full box model.", "Card con box model.", "Card avec box model.", "Karte mit Box-Modell.", "Card com box model.")},
    ],
    "intermediate": [
        {"title": _ml("Flexbox", "Flexbox", "Flexbox", "Flexbox", "Flexbox", "Flexbox"), "content": _ml("Flexbox è un sistema di layout 1D per allineare elementi.", "Flexbox is a 1D layout system for aligning items.", "Flexbox alinea elementos.", "Flexbox aligne les éléments.", "Flexbox richtet Elemente aus.", "Flexbox alinha elementos."), "code": ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}", "code_explanation": _ml("Centra figli orizz/vert.", "Centers children H/V.", "Centra hijos.", "Centre les enfants.", "Zentriert Kinder.", "Centraliza filhos.")},
        {"title": _ml("Responsive design", "Responsive design", "Diseño responsive", "Design responsive", "Responsive Design", "Design responsivo"), "content": _ml("Le media query adattano lo stile a diverse dimensioni.", "Media queries adapt style to different sizes.", "Media queries adaptan.", "Media queries adaptent.", "Media-Queries passen an.", "Media queries adaptam."), "code": "@media (max-width: 768px) {\n  .card { padding: 8px; }\n}", "code_explanation": _ml("Sotto 768px riduce padding.", "Under 768px reduces padding.", "Bajo 768px reduce.", "En dessous de 768px.", "Unter 768px.", "Abaixo de 768px.")},
    ],
    "advanced": [
        {"title": _ml("CSS Grid", "CSS Grid", "CSS Grid", "CSS Grid", "CSS Grid", "CSS Grid"), "content": _ml("Grid è il sistema 2D per layout complessi.", "Grid is the 2D layout system.", "Grid es 2D.", "Grid est 2D.", "Grid ist 2D.", "Grid é 2D."), "code": ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}", "code_explanation": _ml("Layout a 3 colonne.", "3-column layout.", "3 columnas.", "3 colonnes.", "3 Spalten.", "3 colunas.")},
    ],
    "pro": [
        {"title": _ml("Animazioni CSS", "CSS Animations", "Animaciones CSS", "Animations CSS", "CSS-Animationen", "Animações CSS"), "content": _ml("@keyframes definisce animazioni complesse.", "@keyframes defines complex animations.", "@keyframes anima.", "@keyframes anime.", "@keyframes animiert.", "@keyframes anima."), "code": "@keyframes pulse {\n  0%,100% { transform: scale(1); }\n  50% { transform: scale(1.1); }\n}\n.btn { animation: pulse 2s infinite; }", "code_explanation": _ml("Pulsazione infinita.", "Infinite pulse.", "Pulso infinito.", "Pulse infini.", "Endlos pulsierend.", "Pulso infinito.")},
    ],
}

HTML_QUIZZES = {
    "base": [
        {"question": _ml("Quale tag fa il titolo principale?", "Which tag is the main heading?", "¿Cuál es el título principal?", "Quel tag est le titre principal?", "Welcher Tag ist die Hauptüberschrift?", "Qual tag é o título principal?"), "options": [_ml("<h1>", "<h1>"), _ml("<title>", "<title>"), _ml("<head>", "<head>"), _ml("<p>", "<p>")], "correct_index": 0, "explanation": _ml("<h1> è il titolo più importante.", "<h1> is the most important heading.", "<h1> es el principal.", "<h1> est le principal.", "<h1> ist die wichtigste.", "<h1> é o principal.")},
        {"question": _ml("Come crei un link?", "How do you create a link?", "¿Cómo creas un enlace?", "Comment créer un lien?", "Wie erstellt man einen Link?", "Como criar um link?"), "options": [_ml("<link>", "<link>"), _ml("<a href=...>", "<a href=...>"), _ml("<url>", "<url>"), _ml("<ref>", "<ref>")], "correct_index": 1, "explanation": _ml("<a> con attributo href.", "<a> with href attribute.", "<a> con href.", "<a> avec href.", "<a> mit href.", "<a> com href.")},
        {"question": _ml("Quale CSS centra con flex?", "Which CSS centers with flex?", "¿Qué CSS centra con flex?", "Quel CSS centre avec flex?", "Welches CSS zentriert mit flex?", "Qual CSS centraliza com flex?"), "options": [_ml("text-align: center", "text-align: center"), _ml("justify-content: center", "justify-content: center"), _ml("align: middle", "align: middle"), _ml("center: true", "center: true")], "correct_index": 1, "explanation": _ml("justify-content centra orizz.", "justify-content centers H.", "Centra horizontal.", "Centre horizontalement.", "Zentriert horizontal.", "Centraliza horizontalmente.")},
        {"question": _ml("Selettore di classe?", "Class selector?", "Selector de clase?", "Sélecteur de classe?", "Klassenselektor?", "Seletor de classe?"), "options": [_ml(".nome", ".nome"), _ml("#nome", "#nome"), _ml("nome", "nome"), _ml("@nome", "@nome")], "correct_index": 0, "explanation": _ml("Punto + nome classe.", "Dot + class name.", "Punto + nombre.", "Point + nom.", "Punkt + Name.", "Ponto + nome.")},
    ],
    "intermediate": [
        {"question": _ml("display: flex; sull'elemento padre serve a?", "display: flex; on parent does what?", "display: flex; en padre?", "display: flex; sur le parent?", "display: flex; auf Eltern?", "display: flex; no pai?"), "options": [_ml("Lo nasconde", "Hides it"), _ml("Layout flex sui figli", "Flex layout for children"), _ml("Niente", "Nothing"), _ml("Lo centra", "Centers it")], "correct_index": 1, "explanation": _ml("Trasforma i figli in flex items.", "Children become flex items.", "Hijos como flex items.", "Enfants en flex items.", "Kinder werden Flex-Items.", "Filhos viram flex items.")},
    ],
    "advanced": [
        {"question": _ml("grid-template-columns: 1fr 1fr crea?", "grid-template-columns: 1fr 1fr creates?", "1fr 1fr crea?", "1fr 1fr crée?", "1fr 1fr erzeugt?", "1fr 1fr cria?"), "options": [_ml("1 colonna", "1 column"), _ml("2 colonne uguali", "2 equal columns"), _ml("Righe", "Rows"), _ml("Errore", "Error")], "correct_index": 1, "explanation": _ml("Due colonne identiche.", "Two equal cols.", "Dos columnas.", "Deux colonnes.", "Zwei Spalten.", "Duas colunas.")},
    ],
    "pro": [
        {"question": _ml("@keyframes serve per?", "@keyframes is for?", "@keyframes para?", "@keyframes pour?", "@keyframes für?", "@keyframes para?"), "options": [_ml("Variabili", "Variables"), _ml("Animazioni", "Animations"), _ml("Layout", "Layout"), _ml("Selettori", "Selectors")], "correct_index": 1, "explanation": _ml("Definisce step animazione.", "Defines animation steps.", "Pasos de animación.", "Étapes d'animation.", "Animations-Schritte.", "Etapas de animação.")},
    ],
}

HTML_EXERCISES = {
    "base": [
        {"title": _ml("Crea h1", "Create h1", "Crea h1", "Crée h1", "h1 erstellen", "Crie h1"), "instructions": _ml("Crea un titolo h1 'Ciao'.", "Create h1 'Ciao'.", "Crea h1 'Ciao'.", "Crée h1 'Ciao'.", "Erstelle h1 'Ciao'.", "Crie h1 'Ciao'."), "starter_code": "<____>Ciao</____>", "solution": "<h1>Ciao</h1>", "expected_output": "h1 element"},
        {"title": _ml("Stile rosso", "Red style", "Estilo rojo", "Style rouge", "Roter Stil", "Estilo vermelho"), "instructions": _ml("Imposta colore rosso al testo.", "Set text color to red.", "Color rojo.", "Couleur rouge.", "Rote Farbe.", "Cor vermelha."), "starter_code": "p { ____: red; }", "solution": "p { color: red; }", "expected_output": "Red paragraph"},
    ],
    "intermediate": [
        {"title": _ml("Centra con flex", "Center with flex", "Centra con flex", "Centre avec flex", "Mit flex zentrieren", "Centralize com flex"), "instructions": _ml("Centra orizzontalmente con flex.", "Center horizontally with flex.", "Centra horizontal.", "Centre horizontal.", "Horizontal zentrieren.", "Centralize horizontal."), "starter_code": ".box { display: flex; ____: center; }", "solution": ".box { display: flex; justify-content: center; }", "expected_output": "Centered"},
    ],
    "advanced": [
        {"title": _ml("Grid 3 colonne", "3-column grid", "Grid 3 col", "Grid 3 col", "Grid 3 Sp.", "Grid 3 col"), "instructions": _ml("Crea grid a 3 colonne uguali.", "Create 3 equal columns grid.", "3 columnas iguales.", "3 colonnes égales.", "3 gleiche Sp.", "3 colunas iguais."), "starter_code": ".grid { display: grid; grid-template-columns: ____; }", "solution": ".grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }", "expected_output": "3 cols"},
    ],
    "pro": [
        {"title": _ml("Keyframe pulse", "Keyframe pulse", "Keyframe pulse", "Keyframe pulse", "Keyframe pulse", "Keyframe pulse"), "instructions": _ml("Definisci @keyframes pulse 0% e 100% scale 1.", "Define @keyframes pulse with 0% and 100% scale 1.", "Define keyframes.", "Définis keyframes.", "Keyframes definieren.", "Defina keyframes."), "starter_code": "____ pulse { 0%,100% { transform: scale(1); } }", "solution": "@keyframes pulse { 0%,100% { transform: scale(1); } }", "expected_output": "Animation"},
    ],
}

# ============================================================================
# Placeholder content for other languages
# ============================================================================
def _placeholder_lessons(lang_name: str) -> Dict[str, List]:
    return {
        level: [
            {
                "title": _ml(f"{lang_name} - {LEVEL_TITLES[level]['it']} - Lezione 1", f"{lang_name} - {LEVEL_TITLES[level]['en']} - Lesson 1"),
                "content": _ml(f"Contenuto {LEVEL_TITLES[level]['it'].lower()} di {lang_name} in arrivo. Iscriviti per ricevere notifica appena disponibile!", f"{LEVEL_TITLES[level]['en']} {lang_name} content coming soon."),
                "code": f"// {lang_name} placeholder code\n// Coming soon",
                "code_explanation": _ml("Contenuto in arrivo.", "Coming soon."),
            }
        ]
        for level in LEVELS
    }


def _placeholder_quizzes(lang_name: str) -> Dict[str, List]:
    return {
        level: [
            {
                "question": _ml(f"Quiz {lang_name} disponibile presto?", f"{lang_name} quiz coming soon?"),
                "options": [_ml("Sì", "Yes"), _ml("No", "No"), _ml("Forse", "Maybe"), _ml("Non so", "Don't know")],
                "correct_index": 0,
                "explanation": _ml("Stiamo lavorando per portarti il miglior contenuto!", "We're working to bring the best content!"),
            }
        ]
        for level in LEVELS
    }


def _placeholder_exercises(lang_name: str) -> Dict[str, List]:
    return {
        level: [
            {
                "title": _ml(f"Esercizio {lang_name} in arrivo", f"{lang_name} exercise coming soon"),
                "instructions": _ml("Contenuto in preparazione.", "Content in preparation."),
                "starter_code": "// coming soon",
                "solution": "// coming soon",
                "expected_output": "soon",
            }
        ]
        for level in LEVELS
    }


# Map of language id → content
LANGUAGE_CONTENT = {
    "python": (PYTHON_LESSONS, PYTHON_QUIZZES, PYTHON_EXERCISES),
    "javascript": (JS_LESSONS, JS_QUIZZES, JS_EXERCISES),
    "html_css": (HTML_LESSONS, HTML_QUIZZES, HTML_EXERCISES),
}

# Learning paths
PATHS = [
    {"id": "web_developer", "name": _ml("Web Developer", "Web Developer"), "description": _ml("Diventa sviluppatore web frontend completo.", "Become a complete frontend web developer."), "icon": "web", "color": "#3B82F6", "languages": ["html_css", "javascript", "typescript"], "estimated_hours": 80},
    {"id": "python_developer", "name": _ml("Python Developer", "Python Developer"), "description": _ml("Padroneggia Python per ogni scenario.", "Master Python for any scenario."), "icon": "language-python", "color": "#3B82F6", "languages": ["python", "sql"], "estimated_hours": 60},
    {"id": "app_developer", "name": _ml("App Developer", "App Developer"), "description": _ml("Crea app native iOS e Android.", "Build native iOS and Android apps."), "icon": "cellphone", "color": "#8B5CF6", "languages": ["swift", "kotlin", "dart"], "estimated_hours": 100},
    {"id": "backend_developer", "name": _ml("Backend Developer", "Backend Developer"), "description": _ml("Costruisci API e server scalabili.", "Build scalable APIs and servers."), "icon": "server", "color": "#14B8A6", "languages": ["python", "javascript", "go", "sql"], "estimated_hours": 90},
    {"id": "data_analyst", "name": _ml("Data Analyst", "Data Analyst"), "description": _ml("Analizza dati e crea insight.", "Analyze data and create insights."), "icon": "chart-line", "color": "#F59E0B", "languages": ["python", "sql", "r"], "estimated_hours": 70},
]

# Practical projects
PROJECTS = [
    {"id": "todo_app", "title": _ml("To-Do List App", "To-Do List App"), "description": _ml("Crea un'app per gestire le tue attività con HTML, CSS e JavaScript.", "Build a task management app with HTML, CSS and JavaScript."), "difficulty": "base", "language_id": "javascript", "estimated_minutes": 60, "icon": "format-list-checks", "color": "#3B82F6"},
    {"id": "calculator", "title": _ml("Calcolatrice", "Calculator"), "description": _ml("Calcolatrice funzionale in Python.", "Functional Python calculator."), "difficulty": "base", "language_id": "python", "estimated_minutes": 45, "icon": "calculator", "color": "#8B5CF6"},
    {"id": "weather_app", "title": _ml("Weather App", "Weather App"), "description": _ml("App meteo che usa API pubbliche.", "Weather app using public APIs."), "difficulty": "intermediate", "language_id": "javascript", "estimated_minutes": 90, "icon": "weather-partly-cloudy", "color": "#0EA5E9"},
    {"id": "blog_html", "title": _ml("Blog Personale", "Personal Blog"), "description": _ml("Sito blog responsive con HTML/CSS.", "Responsive blog site with HTML/CSS."), "difficulty": "base", "language_id": "html_css", "estimated_minutes": 75, "icon": "post", "color": "#EF4444"},
    {"id": "rest_api", "title": _ml("REST API in Python", "Python REST API"), "description": _ml("API CRUD con FastAPI.", "CRUD API with FastAPI."), "difficulty": "advanced", "language_id": "python", "estimated_minutes": 120, "icon": "api", "color": "#14B8A6"},
    {"id": "portfolio", "title": _ml("Portfolio Online", "Online Portfolio"), "description": _ml("Mostra i tuoi progetti.", "Showcase your projects."), "difficulty": "intermediate", "language_id": "html_css", "estimated_minutes": 90, "icon": "briefcase", "color": "#8B5CF6"},
]

# Subscription plans
PLANS = [
    {"id": "free", "name": {"it": "Free", "en": "Free", "es": "Free", "fr": "Free", "de": "Free", "pt": "Free"}, "price_monthly": 0, "price_yearly": 0, "price_lifetime": 0, "features": {"it": ["3 linguaggi base", "Lezioni base limitate", "Quiz illimitati", "Community"], "en": ["3 base languages", "Limited base lessons", "Unlimited quizzes", "Community"], "es": ["3 lenguajes base", "Lecciones limitadas", "Quizzes ilimitados", "Comunidad"], "fr": ["3 langages base", "Leçons limitées", "Quiz illimités", "Communauté"], "de": ["3 Basis-Sprachen", "Begrenzte Lektionen", "Unbegrenzte Quiz", "Community"], "pt": ["3 linguagens base", "Lições limitadas", "Quizzes ilimitados", "Comunidade"]}, "highlight": False},
    {"id": "pro_monthly", "name": {"it": "Pro Mensile", "en": "Pro Monthly", "es": "Pro Mensual", "fr": "Pro Mensuel", "de": "Pro Monatlich", "pt": "Pro Mensal"}, "price_monthly": 9.99, "price_yearly": 0, "price_lifetime": 0, "features": {"it": ["Tutti i 17 linguaggi", "Tutti i livelli", "AI Tutor illimitato", "Certificati", "No pubblicità"], "en": ["All 17 languages", "All levels", "Unlimited AI Tutor", "Certificates", "No ads"], "es": ["Todos los 17 lenguajes", "Todos los niveles", "AI Tutor ilimitado", "Certificados"], "fr": ["Les 17 langages", "Tous les niveaux", "AI Tutor illimité", "Certificats"], "de": ["Alle 17 Sprachen", "Alle Level", "AI-Tutor unbegrenzt", "Zertifikate"], "pt": ["Todas as 17 linguagens", "Todos os níveis", "AI Tutor ilimitado", "Certificados"]}, "highlight": False},
    {"id": "pro_yearly", "name": {"it": "Pro Annuale", "en": "Pro Yearly", "es": "Pro Anual", "fr": "Pro Annuel", "de": "Pro Jährlich", "pt": "Pro Anual"}, "price_monthly": 0, "price_yearly": 79.99, "price_lifetime": 0, "features": {"it": ["Tutto Pro Mensile", "Risparmi il 33%", "Progetti pratici", "Supporto prioritario"], "en": ["All Pro Monthly", "Save 33%", "Practical projects", "Priority support"], "es": ["Todo Pro Mensual", "Ahorra 33%", "Proyectos", "Soporte prioritario"], "fr": ["Tout Pro Mensuel", "Économie 33%", "Projets", "Support prioritaire"], "de": ["Alle Pro Monatlich", "33% sparen", "Projekte", "Priorität-Support"], "pt": ["Tudo Pro Mensal", "Economize 33%", "Projetos", "Suporte prioritário"]}, "highlight": True},
    {"id": "lifetime", "name": {"it": "Lifetime", "en": "Lifetime", "es": "Lifetime", "fr": "Lifetime", "de": "Lifetime", "pt": "Lifetime"}, "price_monthly": 0, "price_yearly": 0, "price_lifetime": 199.0, "features": {"it": ["Accesso a vita", "Tutti i contenuti futuri", "Sessioni 1:1 trimestrali", "Badge esclusivo"], "en": ["Lifetime access", "All future content", "Quarterly 1:1 sessions", "Exclusive badge"], "es": ["Acceso de por vida", "Contenido futuro", "Sesiones 1:1", "Insignia exclusiva"], "fr": ["Accès à vie", "Contenu futur", "Sessions 1:1", "Badge exclusif"], "de": ["Lebenslanger Zugang", "Zukünftige Inhalte", "1:1-Sitzungen", "Exklusives Abzeichen"], "pt": ["Acesso vitalício", "Conteúdo futuro", "Sessões 1:1", "Selo exclusivo"]}, "highlight": False},
]

# Available badges
BADGES = [
    {"id": "first_lesson", "name": _ml("Primo passo", "First step"), "description": _ml("Hai completato la tua prima lezione!", "You completed your first lesson!"), "icon": "shoe-print", "color": "#22C55E", "criteria": "complete_1_lesson"},
    {"id": "lesson_5", "name": _ml("In corsa", "Running"), "description": _ml("5 lezioni completate.", "5 lessons completed."), "icon": "run", "color": "#3B82F6", "criteria": "complete_5_lessons"},
    {"id": "lesson_25", "name": _ml("Studente serio", "Serious learner"), "description": _ml("25 lezioni completate.", "25 lessons completed."), "icon": "school", "color": "#8B5CF6", "criteria": "complete_25_lessons"},
    {"id": "first_quiz", "name": _ml("Quiz Master", "Quiz Master"), "description": _ml("Primo quiz superato.", "First quiz passed."), "icon": "trophy", "color": "#F59E0B", "criteria": "pass_1_quiz"},
    {"id": "perfect_quiz", "name": _ml("Perfezionista", "Perfectionist"), "description": _ml("Quiz al 100%.", "100% quiz score."), "icon": "star", "color": "#F59E0B", "criteria": "perfect_quiz"},
    {"id": "streak_3", "name": _ml("3 giorni di fila", "3-day streak"), "description": _ml("Streak di 3 giorni.", "3-day streak."), "icon": "fire", "color": "#EF4444", "criteria": "streak_3"},
    {"id": "streak_7", "name": _ml("Settimana solida", "Solid week"), "description": _ml("Streak di 7 giorni.", "7-day streak."), "icon": "fire", "color": "#EF4444", "criteria": "streak_7"},
    {"id": "first_project", "name": _ml("Costruttore", "Builder"), "description": _ml("Primo progetto completato.", "First project completed."), "icon": "hammer-wrench", "color": "#14B8A6", "criteria": "complete_1_project"},
]
