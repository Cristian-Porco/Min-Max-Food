# Min Max Food - Piano Alimentare

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![PHP](https://img.shields.io/badge/PHP-7.4+-777BB4?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?logo=tailwind-css&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)

![Home Screen](docs/img/home_screen.png)

Applicazione web per organizzare piani alimentari giornalieri con calcolo automatico dei valori nutrizionali tramite il **problema di flusso a costo minimo (Minimum Cost Flow)**, gestione alternative e ottimizzazione macronutrienti.

## Caratteristiche

Sono presenti diverse caratteristiche all'interno dell'applicazione web:

- **Gestione alternative**: crea più varianti per ogni pasto con la stessa base nutrizionale;
- **Ottimizzazione automatica**: algoritmo di ottimizzazione per avvicinare i valori ai limiti impostati;
- **Calcolo dinamico**: calcolo automatico dei macro in base ai grammi inseriti;
- **Limiti personalizzati**: imposta limiti massimi per calorie, proteine, carboidrati e grassi;
- **Note**: aggiungi annotazioni e osservazioni al piano alimentare;
- **Export/Import JSON**: salva e carica piani completi con limiti e note;
- **Stampa PDF**: genera PDF professionale con tutte le alternative e totali;
- **Drag & Drop**: riordina gli alimenti trascinandoli.

## Struttura del Progetto

```
ProjectMinMaxFood/
├── index.php              # Pagina principale
├── assets/
│   ├── js/
│   │   └── app.js        # Logica applicazione
│   └── css/              # (riservato per futuri CSS custom)
├── config/
│   └── config.php        # Configurazione database
├── includes/
│   ├── api.php           # API recupero alimenti
│   └── add_food.php      # API aggiunta alimenti
├── sql/
│   └── database.sql      # Schema database e dati iniziali
└── README.md             # Documentazione
```

## Installazione

### 1. Configura il Database

Importa il file `sql/database.sql` nel tuo MySQL:

```bash
mysql -u root -p < sql/database.sql
```

Oppure tramite phpMyAdmin:
1. Apri phpMyAdmin
2. Crea un nuovo database chiamato `piano_alimentare`
3. Importa il file `sql/database.sql`

### 2. Configura la Connessione Database

Modifica il file `config/config.php` con le tue credenziali MySQL:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'tua_password');
define('DB_NAME', 'piano_alimentare');
```

### 3. Avvia il Server

#### Opzione A: PHP Built-in Server (per sviluppo)

```bash
cd /percorso/al/progetto
php -S localhost:8000
```

Poi apri il browser su: `http://localhost:8000`

#### Opzione B: XAMPP/WAMP/MAMP

1. Copia la cartella del progetto in `htdocs` (XAMPP) o `www` (WAMP)
2. Avvia Apache e MySQL
3. Apri: `http://localhost/ProjectMinMaxFood`

#### Opzione C: Server Apache/Nginx

Configura il virtual host per puntare alla directory del progetto.

## Utilizzo

### Aggiungere Alimenti al Piano

1. **Seleziona un alimento** dal menu a tendina (organizzato per categorie)
2. **Inserisci la quantità** in grammi (default: 100g)
3. **Scegli il pasto** (Colazione, Pranzo, Cena, Spuntini)
4. Clicca **"Aggiungi al Piano"**

I valori nutrizionali vengono calcolati automaticamente in base alla quantità inserita.

### Visualizzare Totali

- **Totali per pasto**: visualizzati in fondo a ogni sezione del pasto
- **Totali giornalieri**: visualizzati nella sezione in basso con sfondo colorato

### Rimuovere Alimenti

Clicca sul pulsante **"Rimuovi"** accanto all'alimento che vuoi eliminare.

### Esportare il Piano

1. Clicca su **"Esporta Piano (JSON)"**
2. Il file JSON verrà scaricato automaticamente con il nome `piano-alimentare-YYYY-MM-DD.json`

### Importare un Piano

1. Clicca su **"Importa Piano (JSON)"**
2. Seleziona un file JSON precedentemente esportato
3. Conferma se vuoi sovrascrivere il piano attuale

### Cancellare Tutto

Clicca su **"Cancella Tutto"** per rimuovere tutti gli alimenti da tutti i pasti.

## Struttura del Progetto

```
ProjectMinMaxFood/
├── index.php          # Pagina principale
├── app.js            # Logica JavaScript
├── api.php           # API per recuperare alimenti
├── config.php        # Configurazione database
├── database.sql      # Schema e dati del database
└── README.md         # Questa documentazione
```

## Database

### Tabella: alimenti

| Campo        | Tipo         | Descrizione                    |
|--------------|--------------|--------------------------------|
| id           | INT          | ID univoco                     |
| nome         | VARCHAR(100) | Nome dell'alimento             |
| calorie      | DECIMAL(6,2) | Calorie per 100g               |
| proteine     | DECIMAL(6,2) | Proteine in grammi per 100g    |
| carboidrati  | DECIMAL(6,2) | Carboidrati in grammi per 100g |
| grassi       | DECIMAL(6,2) | Grassi in grammi per 100g      |
| fibre        | DECIMAL(6,2) | Fibre in grammi per 100g       |
| zuccheri     | DECIMAL(6,2) | Zuccheri in grammi per 100g    |
| categoria    | VARCHAR(50)  | Categoria alimento             |
| created_at   | TIMESTAMP    | Data creazione                 |

Il database include oltre 50 alimenti italiani comuni, suddivisi in categorie:
- Cereali
- Carne
- Pesce
- Latticini
- Uova
- Legumi
- Frutta secca
- Frutta
- Verdure
- Condimenti

## Tecnologie Utilizzate

- **Backend**: PHP puro
- **Database**: MySQL
- **Frontend**: HTML5, CSS3 (Tailwind CSS)
- **JavaScript**: Vanilla JS (ES6+)

## Note Importanti

- I piani alimentari **NON vengono salvati nel database**
- Solo gli alimenti sono memorizzati nel database
- I piani possono essere salvati localmente tramite export JSON
- Tutti i calcoli avvengono lato client in tempo reale

## Aggiungere Nuovi Alimenti

Per aggiungere nuovi alimenti al database:

```sql
INSERT INTO alimenti (nome, calorie, proteine, carboidrati, grassi, fibre, zuccheri, categoria)
VALUES ('Nome Alimento', 100.0, 10.0, 20.0, 5.0, 2.0, 1.0, 'Categoria');
```

Si possono inserire alimenti tramite interfaccia grafica dell'applicazione web.