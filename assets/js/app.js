/**
 * Piano Alimentare - JavaScript Application
 * Gestione dinamica del piano alimentare con calcolo macro
 */

// Variabili globali
let foodDatabase = [];
// Struttura: { colazione: { alternatives: [[...], [...]], active: 0 }, ... }
let mealPlan = {
    colazione: { alternatives: [[]], active: 0 },
    pranzo: { alternatives: [[]], active: 0 },
    cena: { alternatives: [[]], active: 0 },
    spuntini: { alternatives: [[]], active: 0 }
};
let planNotes = '';

// Variabili per drag and drop
let draggedElement = null;
let draggedItemId = null;
let draggedMealType = null;
let draggedAlternativeIndex = null;

/**
 * Inizializzazione dell'applicazione
 * Carica il database alimenti, configura gli event listener e inizializza lo stato dell'UI
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    loadFoodDatabase();
    setupEventListeners();
    // Inizializza lo stato delle colonne dettagliate (nascoste di default)
    toggleDetailedColumns();
    // Event listener per form aggiunta alimento
    setupAddFoodForm();
    // Inizializza il select delle alternative
    updateAlternativeSelect();
    // Inizializza i totali giornalieri
    updateDailyTotals();
});

/**
 * Attiva/disattiva la visualizzazione delle colonne dettagliate (Fibre e Zuccheri)
 * Aggiunge o rimuove la classe CSS 'hide-details' dal body
 * @function toggleDetailedColumns
 */
function toggleDetailedColumns() {
    const checkbox = document.getElementById('showDetailedColumns');
    const body = document.body;

    if (checkbox.checked) {
        // Mostra colonne dettagliate
        body.classList.remove('hide-details');
    } else {
        // Nascondi colonne dettagliate
        body.classList.add('hide-details');
    }
}

/**
 * Carica il database degli alimenti dall'API
 * Effettua una chiamata fetch all'endpoint API e popola la variabile globale foodDatabase
 * @async
 * @function loadFoodDatabase
 * @throws {Error} Se la chiamata API fallisce
 */
async function loadFoodDatabase() {
    try {
        const response = await fetch('includes/api.php');
        const result = await response.json();

        if (result.success) {
            foodDatabase = result.data;
            populateFoodSelect();
        } else {
            showNotification('Errore nel caricamento degli alimenti', 'error');
        }
    } catch (error) {
        console.error('Errore:', error);
        showNotification('Errore di connessione al server', 'error');
    }
}

/**
 * Popola il menu a tendina con la lista degli alimenti
 * Organizza gli alimenti per categoria usando optgroup
 * @function populateFoodSelect
 */
function populateFoodSelect() {
    const select = document.getElementById('foodSelect');

    // Pulisci la select prima di ripopolarla
    select.innerHTML = '<option value="">-- Seleziona un alimento --</option>';

    // Raggruppa per categoria
    const categories = {};
    foodDatabase.forEach(food => {
        if (!categories[food.categoria]) {
            categories[food.categoria] = [];
        }
        categories[food.categoria].push(food);
    });

    // Crea optgroup per ogni categoria
    Object.keys(categories).sort().forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        categories[category].forEach(food => {
            const option = document.createElement('option');
            option.value = food.id;
            option.textContent = `${food.nome} (${food.calorie} kcal/100g)`;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });
}

/**
 * Configura gli event listener per gli elementi del form
 * Associa eventi di change e input ai controlli per la selezione degli alimenti e aggiornamento dei limiti nutrizionali
 * @function setupEventListeners
 */
function setupEventListeners() {
    const foodSelect = document.getElementById('foodSelect');
    const quantityInput = document.getElementById('quantityInput');

    foodSelect.addEventListener('change', updateFoodPreview);
    quantityInput.addEventListener('input', updateFoodPreview);

    // Event listener per cambiamenti nei limiti
    document.getElementById('limit-calorie').addEventListener('input', updateDailyTotals);
    document.getElementById('limit-proteine').addEventListener('input', updateDailyTotals);
    document.getElementById('limit-carboidrati').addEventListener('input', updateDailyTotals);
    document.getElementById('limit-grassi').addEventListener('input', updateDailyTotals);
}

/**
 * Aggiorna l'anteprima dei valori nutrizionali dell'alimento selezionato
 * Calcola e mostra calorie, proteine, carboidrati, grassi, fibre e zuccheri in base alla quantità inserita
 * @function updateFoodPreview
 */
function updateFoodPreview() {
    const foodId = parseInt(document.getElementById('foodSelect').value);
    const quantity = parseFloat(document.getElementById('quantityInput').value) || 0;

    const foodInfo = document.getElementById('foodInfo');

    if (!foodId || quantity <= 0) {
        foodInfo.classList.add('hidden');
        return;
    }

    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return;

    // Calcola valori per la quantità selezionata
    const multiplier = quantity / 100;

    document.getElementById('previewCalorie').textContent = (food.calorie * multiplier).toFixed(1);
    document.getElementById('previewProteine').textContent = (food.proteine * multiplier).toFixed(1);
    document.getElementById('previewCarboidrati').textContent = (food.carboidrati * multiplier).toFixed(1);
    document.getElementById('previewGrassi').textContent = (food.grassi * multiplier).toFixed(1);
    document.getElementById('previewFibre').textContent = (food.fibre * multiplier).toFixed(1);
    document.getElementById('previewZuccheri').textContent = (food.zuccheri * multiplier).toFixed(1);
    document.getElementById('previewQuantita').textContent = quantity;

    foodInfo.classList.remove('hidden');
}

/**
 * Aggiunge un alimento al pasto selezionato con la quantità specificata
 * Valida i dati di input, calcola i valori nutrizionali e aggiorna l'UI
 * @function addFoodToMeal
 */
function addFoodToMeal() {
    const foodId = parseInt(document.getElementById('foodSelect').value);
    const quantity = parseFloat(document.getElementById('quantityInput').value);
    const mealType = document.getElementById('mealSelect').value;

    if (!foodId) {
        showNotification('Seleziona un alimento', 'warning');
        return;
    }

    if (!quantity || quantity <= 0) {
        showNotification('Inserisci una quantità valida', 'warning');
        return;
    }

    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return;

    // Calcola valori nutrizionali per la quantità
    const multiplier = quantity / 100;
    const mealItem = {
        id: Date.now(), // ID unico per rimuovere l'elemento
        foodId: food.id,
        nome: food.nome,
        quantity: quantity,
        calorie: parseFloat((food.calorie * multiplier).toFixed(2)),
        proteine: parseFloat((food.proteine * multiplier).toFixed(2)),
        carboidrati: parseFloat((food.carboidrati * multiplier).toFixed(2)),
        grassi: parseFloat((food.grassi * multiplier).toFixed(2)),
        fibre: parseFloat((food.fibre * multiplier).toFixed(2)),
        zuccheri: parseFloat((food.zuccheri * multiplier).toFixed(2))
    };

    // Aggiungi all'alternativa selezionata
    const selectedAltIndex = parseInt(document.getElementById('alternativeSelect').value);
    mealPlan[mealType].alternatives[selectedAltIndex].push(mealItem);

    // Aggiorna UI
    renderMealSection(mealType);
    updateDailyTotals();

    // Reset form
    document.getElementById('foodSelect').value = '';
    document.getElementById('quantityInput').value = '100';
    document.getElementById('foodInfo').classList.add('hidden');

    showNotification('Alimento aggiunto con successo', 'success');
}

/**
 * Aggiorna il menu a tendina delle alternative in base al tipo di pasto selezionato
 * Popola il select con le alternative disponibili e marca quella consigliata (attiva)
 * @function updateAlternativeSelect
 */
function updateAlternativeSelect() {
    const mealType = document.getElementById('mealSelect').value;
    const alternativeSelect = document.getElementById('alternativeSelect');
    const meal = mealPlan[mealType];

    // Svuota e riempi le opzioni
    alternativeSelect.innerHTML = '';

    meal.alternatives.forEach((alt, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Alternativa ${index + 1}${index === meal.active ? ' (Consigliata)' : ''}`;
        if (index === meal.active) {
            option.selected = true;
        }
        alternativeSelect.appendChild(option);
    });
}

/**
 * Renderizza l'intera sezione di un pasto con tutte le sue alternative
 * Crea la struttura HTML completa con tabelle, bottoni e totali per ogni alternativa
 * @function renderMealSection
 * @param {string} mealType - Il tipo di pasto da renderizzare (colazione, pranzo, cena, spuntini)
 */
function renderMealSection(mealType) {
    const container = document.getElementById(`${mealType}Container`);
    const meal = mealPlan[mealType];

    let html = '';

    // Pulsante aggiungi alternativa
    html += `
        <div class="flex items-center gap-2 mb-4">
            <button onclick="addAlternative('${mealType}')"
                    class="px-3 py-1.5 rounded-lg font-medium transition text-sm bg-green-500 text-white hover:bg-green-600 flex items-center gap-1 shadow-md">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nuova Alternativa
            </button>
        </div>
    `;

    // Itera su tutte le alternative e mostrali come lista
    meal.alternatives.forEach((alternative, altIndex) => {
        const altNumber = altIndex + 1;
        const isActive = altIndex === meal.active;

        html += `
            <div class="mb-6 border-2 rounded-lg overflow-hidden ${isActive ? 'border-indigo-500 shadow-lg' : 'border-gray-200'}">
                <div class="bg-gradient-to-r ${isActive ? 'from-indigo-600 to-purple-600' : 'from-gray-400 to-gray-500'} px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <h3 class="text-white font-semibold text-base">Alternativa ${altNumber}</h3>
                        ${isActive ? '<span class="bg-white text-indigo-600 px-2 py-0.5 rounded text-xs font-bold">CONSIGLIATA</span>' : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        ${alternative.length > 0 ? `
                            <button onclick="optimizeQuantities('${mealType}', ${altIndex})"
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                </svg>
                                Ottimizza
                            </button>
                        ` : ''}
                        ${!isActive ? `
                            <button onclick="switchAlternative('${mealType}', ${altIndex})"
                                    class="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-xs font-medium transition">
                                Consiglia
                            </button>
                        ` : ''}
                        ${meal.alternatives.length > 1 ? `
                            <button onclick="removeAlternative('${mealType}', ${altIndex})"
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Elimina
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="bg-white p-4">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b-2 border-gray-200">
                                    <th class="py-2 px-2 text-sm w-8"></th>
                                    <th class="text-left py-2 px-2 text-sm">Alimento</th>
                                    <th class="text-right py-2 px-2 text-sm">Quantità (g)</th>
                                    <th class="text-right py-2 px-2 text-sm">Calorie</th>
                                    <th class="text-right py-2 px-2 text-sm">Proteine (g)</th>
                                    <th class="text-right py-2 px-2 text-sm">Carbo (g)</th>
                                    <th class="text-right py-2 px-2 text-sm">Grassi (g)</th>
                                    <th class="text-right py-2 px-2 text-sm detailed-column">Fibre (g)</th>
                                    <th class="text-right py-2 px-2 text-sm detailed-column">Zuccheri (g)</th>
                                    <th class="text-center py-2 px-2 text-sm">Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="${mealType}Table_${altIndex}">
        `;

        if (alternative.length === 0) {
            html += '<tr><td colspan="10" class="text-center py-8 text-gray-400">Nessun alimento inserito</td></tr>';
        } else {
            alternative.forEach((item) => {
                html += `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 draggable-row"
                        draggable="true"
                        data-item-id="${item.id}"
                        data-meal-type="${mealType}"
                        data-alt-index="${altIndex}">
                        <td class="py-2 px-2 text-sm w-8">
                            <svg class="w-4 h-4 drag-handle mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                            </svg>
                        </td>
                        <td class="py-2 px-2 text-sm">${item.nome}</td>
                        <td class="text-right py-2 px-2 text-sm">
                            <input type="number"
                                   value="${item.quantity.toFixed(0)}"
                                   min="1"
                                   onchange="updateFoodQuantity('${mealType}', ${altIndex}, ${item.id}, this.value)"
                                   class="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        </td>
                        <td class="text-right py-2 px-2 text-sm">${item.calorie.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm">${item.proteine.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm">${item.carboidrati.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm">${item.grassi.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm detailed-column">${item.fibre.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm detailed-column">${item.zuccheri.toFixed(1)}</td>
                        <td class="text-center py-2 px-2">
                            <button onclick="removeFoodFromMeal('${mealType}', ${altIndex}, ${item.id})"
                                    class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition">
                                Rimuovi
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        html += '</tbody>';

        // Footer con totali
        if (alternative.length > 0) {
            const totals = calculateAlternativeTotals(mealType, altIndex);
            html += `
                <tfoot>
                    <tr class="border-t-2 border-gray-500 font-bold bg-gray-50">
                        <td class="py-2 px-2 text-sm"></td>
                        <td class="py-2 px-2 text-sm">TOTALE</td>
                        <td class="text-right py-2 px-2 text-sm">${totals.quantity.toFixed(0)}</td>
                        <td class="text-right py-2 px-2 text-sm">${totals.calorie.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm">${totals.proteine.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm">${totals.carboidrati.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm">${totals.grassi.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm detailed-column">${totals.fibre.toFixed(1)}</td>
                        <td class="text-right py-2 px-2 text-sm detailed-column">${totals.zuccheri.toFixed(1)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            `;
        }

        html += `
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Riattacca event listeners per drag and drop per tutte le alternative
    meal.alternatives.forEach((_, altIndex) => {
        attachDragEvents(mealType, altIndex);
    });
}

/**
 * Calcola i totali nutrizionali di una specifica alternativa di un pasto
 * Somma quantità, calorie, proteine, carboidrati, grassi, fibre e zuccheri di tutti gli alimenti dell'alternativa
 * @function calculateAlternativeTotals
 * @param {string} mealType - Il tipo di pasto (colazione, pranzo, cena, spuntini)
 * @param {number} altIndex - L'indice dell'alternativa da calcolare
 * @returns {Object} Oggetto contenente i totali di tutti i macronutrienti
 */
function calculateAlternativeTotals(mealType, altIndex) {
    const meals = mealPlan[mealType].alternatives[altIndex];

    return meals.reduce((totals, item) => {
        totals.quantity += item.quantity;
        totals.calorie += item.calorie;
        totals.proteine += item.proteine;
        totals.carboidrati += item.carboidrati;
        totals.grassi += item.grassi;
        totals.fibre += item.fibre;
        totals.zuccheri += item.zuccheri;
        return totals;
    }, {
        quantity: 0,
        calorie: 0,
        proteine: 0,
        carboidrati: 0,
        grassi: 0,
        fibre: 0,
        zuccheri: 0
    });
}

/**
 * Cambia l'alternativa attiva (consigliata) e propaga il cambiamento a tutti i pasti
 * Imposta l'alternativa specificata come attiva per tutti i tipi di pasto e aggiorna l'UI
 * @function switchAlternative
 * @param {string} mealType - Il tipo di pasto da cui parte il cambiamento
 * @param {number} altIndex - L'indice dell'alternativa da impostare come attiva
 */
function switchAlternative(mealType, altIndex) {
    // Cambia l'alternativa attiva per TUTTI i pasti
    Object.keys(mealPlan).forEach(mt => {
        // Verifica che l'alternativa esista anche negli altri pasti
        if (mealPlan[mt].alternatives[altIndex]) {
            mealPlan[mt].active = altIndex;
        }
    });

    // Aggiorna tutte le sezioni
    renderMealSection('colazione');
    renderMealSection('pranzo');
    renderMealSection('cena');
    renderMealSection('spuntini');
    updateDailyTotals();
    updateAlternativeSelect(); // Aggiorna il select nel form

    showNotification(`Alternativa ${altIndex + 1} impostata come consigliata per tutti i pasti`, 'success');
}

/**
 * Aggiunge una nuova alternativa al pasto specificato
 * Crea una copia profonda dell'alternativa corrente e la imposta come attiva
 * @function addAlternative
 * @param {string} mealType - Il tipo di pasto a cui aggiungere l'alternativa
 */
function addAlternative(mealType) {
    const currentAlt = mealPlan[mealType].active;
    const currentAlternative = mealPlan[mealType].alternatives[currentAlt];

    // Crea una copia profonda dell'alternativa corrente
    const newAlternative = currentAlternative.map(item => ({
        ...item,
        id: Date.now() + Math.random() // Nuovo ID univoco per ogni elemento
    }));

    mealPlan[mealType].alternatives.push(newAlternative);
    mealPlan[mealType].active = mealPlan[mealType].alternatives.length - 1;
    renderMealSection(mealType);
    updateAlternativeSelect(); // Aggiorna il select nel form
    showNotification('Nuova alternativa creata con gli stessi alimenti', 'success');
}

/**
 * Rimuove un'alternativa dal pasto specificato
 * Chiede conferma all'utente prima di eliminare e aggiorna gli indici attivi se necessario
 * @function removeAlternative
 * @param {string} mealType - Il tipo di pasto da cui rimuovere l'alternativa
 * @param {number} altIndex - L'indice dell'alternativa da rimuovere
 */
function removeAlternative(mealType, altIndex) {
    const meal = mealPlan[mealType];

    if (meal.alternatives.length <= 1) {
        showNotification('Non puoi eliminare l\'unica alternativa', 'warning');
        return;
    }

    if (!confirm('Sei sicuro di voler eliminare questa alternativa?')) {
        return;
    }

    meal.alternatives.splice(altIndex, 1);

    // Aggiorna l'alternativa attiva se necessario
    if (meal.active >= meal.alternatives.length) {
        meal.active = meal.alternatives.length - 1;
    } else if (meal.active > altIndex) {
        meal.active--;
    }

    renderMealSection(mealType);
    updateAlternativeSelect();
    updateDailyTotals();
    showNotification('Alternativa eliminata', 'info');
}

/**
 * Ottimizza le grammature di tutti i pasti di un'alternativa specifica per raggiungere i limiti nutrizionali giornalieri
 * Utilizza un algoritmo iterativo per massimizzare l'utilizzo dei limiti senza superarli
 * Considera tutti i pasti della stessa alternativa (es. Colazione Alt.1 + Pranzo Alt.1 + Cena Alt.1 + Spuntini Alt.1)
 * @function optimizeQuantities
 * @param {string} mealType - Il tipo di pasto da cui parte l'ottimizzazione
 * @param {number} altIndex - L'indice dell'alternativa da ottimizzare
 */
function optimizeQuantities(mealType, altIndex) {
    // Raccogli tutti gli alimenti da TUTTI i pasti della stessa alternativa
    const allMealTypes = ['colazione', 'pranzo', 'cena', 'spuntini'];

    // Verifica che almeno un pasto abbia alimenti
    const hasAnyFood = allMealTypes.some(mt =>
        mealPlan[mt].alternatives[altIndex] && mealPlan[mt].alternatives[altIndex].length > 0
    );

    if (!hasAnyFood) {
        showNotification('Nessun alimento da ottimizzare in questa alternativa', 'warning');
        return;
    }

    // Ottieni i limiti massimi giornalieri
    const maxCalorie = parseFloat(document.getElementById('limit-calorie').value) || 2500;
    const maxProteine = parseFloat(document.getElementById('limit-proteine').value) || 150;
    const maxCarboidrati = parseFloat(document.getElementById('limit-carboidrati').value) || 300;
    const maxGrassi = parseFloat(document.getElementById('limit-grassi').value) || 80;

    // Raccogli tutti gli alimenti da tutti i pasti con riferimento alla loro posizione
    const allFoods = [];
    allMealTypes.forEach(mt => {
        const alternative = mealPlan[mt].alternatives[altIndex];
        if (alternative) {
            alternative.forEach((item, itemIndex) => {
                const food = foodDatabase.find(f => f.id === item.foodId);
                allFoods.push({
                    mealType: mt,
                    itemIndex: itemIndex,
                    itemRef: item,
                    calorie: food.calorie,
                    proteine: food.proteine,
                    carboidrati: food.carboidrati,
                    grassi: food.grassi,
                    fibre: food.fibre,
                    zuccheri: food.zuccheri,
                    currentQuantity: item.quantity
                });
            });
        }
    });

    if (allFoods.length === 0) {
        showNotification('Nessun alimento da ottimizzare', 'warning');
        return;
    }

    // Algoritmo di ottimizzazione iterativo
    // Obiettivo: massimizzare l'utilizzo dei limiti GIORNALIERI senza superarli
    const maxIterations = 100;
    const tolerance = 0.01;
    let iterations = 0;

    // Inizia con le quantità correnti
    let quantities = allFoods.map(f => f.currentQuantity);

    // Calcola i totali giornalieri
    function calculateDailyTotals(qtys) {
        return {
            calorie: qtys.reduce((sum, qty, i) => sum + (allFoods[i].calorie * qty / 100), 0),
            proteine: qtys.reduce((sum, qty, i) => sum + (allFoods[i].proteine * qty / 100), 0),
            carboidrati: qtys.reduce((sum, qty, i) => sum + (allFoods[i].carboidrati * qty / 100), 0),
            grassi: qtys.reduce((sum, qty, i) => sum + (allFoods[i].grassi * qty / 100), 0)
        };
    }

    // Trova il nutriente limitante (quello più vicino al limite)
    function findLimitingFactor(totals) {
        return Math.max(
            totals.calorie / maxCalorie,
            totals.proteine / maxProteine,
            totals.carboidrati / maxCarboidrati,
            totals.grassi / maxGrassi
        );
    }

    let totals = calculateDailyTotals(quantities);
    let limitingFactor = findLimitingFactor(totals);

    // Se siamo già oltre i limiti, scala verso il basso
    if (limitingFactor > 1) {
        const scaleFactor = 0.95 / limitingFactor; // Scala al 95% del limite
        quantities = quantities.map(qty => Math.max(10, qty * scaleFactor));
        totals = calculateDailyTotals(quantities);
        limitingFactor = findLimitingFactor(totals);
    }

    // Iterazione per avvicinarsi ai limiti giornalieri
    while (iterations < maxIterations && limitingFactor < 0.95) {
        // Calcola quanto possiamo aumentare prima di superare un limite
        const scaleFactors = [
            totals.calorie > 0 ? maxCalorie * 0.98 / totals.calorie : Infinity,
            totals.proteine > 0 ? maxProteine * 0.98 / totals.proteine : Infinity,
            totals.carboidrati > 0 ? maxCarboidrati * 0.98 / totals.carboidrati : Infinity,
            totals.grassi > 0 ? maxGrassi * 0.98 / totals.grassi : Infinity
        ];

        const maxScale = Math.min(...scaleFactors);

        // Se non possiamo scalare oltre, esci
        if (maxScale <= 1 + tolerance) break;

        // Scala le quantità proporzionalmente
        quantities = quantities.map(qty => qty * Math.min(maxScale, 1.5)); // Max 50% per iterazione

        // Ricalcola
        totals = calculateDailyTotals(quantities);
        limitingFactor = findLimitingFactor(totals);
        iterations++;
    }

    // Applica le nuove quantità a tutti gli alimenti
    allFoods.forEach((food, index) => {
        const newQuantity = Math.round(quantities[index]);
        const multiplier = newQuantity / 100;

        food.itemRef.quantity = newQuantity;
        food.itemRef.calorie = parseFloat((food.calorie * multiplier).toFixed(2));
        food.itemRef.proteine = parseFloat((food.proteine * multiplier).toFixed(2));
        food.itemRef.carboidrati = parseFloat((food.carboidrati * multiplier).toFixed(2));
        food.itemRef.grassi = parseFloat((food.grassi * multiplier).toFixed(2));
        food.itemRef.fibre = parseFloat((food.fibre * multiplier).toFixed(2));
        food.itemRef.zuccheri = parseFloat((food.zuccheri * multiplier).toFixed(2));
    });

    // Aggiorna UI per tutti i pasti
    allMealTypes.forEach(mt => {
        renderMealSection(mt);
    });
    updateDailyTotals();

    const finalTotals = calculateDailyTotals(quantities);
    const utilizzo = (limitingFactor * 100).toFixed(1);

    showNotification(
        `Alternativa ${altIndex + 1} ottimizzata! Utilizzo limiti giornalieri: ${utilizzo}% (Cal: ${finalTotals.calorie.toFixed(0)}, P: ${finalTotals.proteine.toFixed(1)}g, C: ${finalTotals.carboidrati.toFixed(1)}g, G: ${finalTotals.grassi.toFixed(1)}g)`,
        'success'
    );
}

/**
 * Associa gli event listener per il drag and drop alle righe degli alimenti
 * Permette di riordinare gli alimenti all'interno di un'alternativa trascinandoli
 * @function attachDragEvents
 * @param {string} mealType - Il tipo di pasto
 * @param {number} altIndex - L'indice dell'alternativa
 */
function attachDragEvents(mealType, altIndex) {
    const rows = document.querySelectorAll(`#${mealType}Table_${altIndex} tr.draggable-row`);
    rows.forEach(row => {
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
        row.addEventListener('dragend', handleDragEnd);
    });
}

/**
 * Calcola i totali nutrizionali dell'alternativa attiva di un pasto
 * Wrapper che delega il calcolo a calculateAlternativeTotals per l'alternativa corrente
 * @function calculateMealTotals
 * @param {string} mealType - Il tipo di pasto
 * @returns {Object} Oggetto contenente i totali nutrizionali dell'alternativa attiva
 */
function calculateMealTotals(mealType) {
    const activeAlt = mealPlan[mealType].active;
    return calculateAlternativeTotals(mealType, activeAlt);
}

/**
 * Gestisce l'inizio del trascinamento di un alimento
 * Salva i dati dell'elemento trascinato e imposta l'effetto visivo
 * @function handleDragStart
 * @param {DragEvent} e - L'evento di drag start
 */
function handleDragStart(e) {
    draggedElement = e.currentTarget;
    draggedItemId = parseInt(e.currentTarget.dataset.itemId);
    draggedMealType = e.currentTarget.dataset.mealType;
    draggedAlternativeIndex = parseInt(e.currentTarget.dataset.altIndex);

    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

/**
 * Gestisce l'evento quando un elemento trascinato passa sopra un'area di drop valida
 * Previene il comportamento di default e aggiunge l'effetto visivo di hover
 * @function handleDragOver
 * @param {DragEvent} e - L'evento di drag over
 * @returns {boolean} Ritorna false per prevenire il comportamento di default
 */
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';

    const targetRow = e.currentTarget;
    const targetMealType = targetRow.dataset.mealType;
    const targetAltIndex = parseInt(targetRow.dataset.altIndex);

    // Permetti solo riordino all'interno della stessa alternativa dello stesso pasto
    if (draggedMealType === targetMealType && draggedAlternativeIndex === targetAltIndex && targetRow !== draggedElement) {
        targetRow.classList.add('drag-over');
    }

    return false;
}

/**
 * Gestisce il rilascio di un elemento trascinato su una nuova posizione
 * Riordina gli elementi se il drop avviene nella stessa alternativa
 * @function handleDrop
 * @param {DragEvent} e - L'evento di drop
 * @returns {boolean} Ritorna false per prevenire il comportamento di default
 */
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const targetRow = e.currentTarget;
    const targetItemId = parseInt(targetRow.dataset.itemId);
    const targetMealType = targetRow.dataset.mealType;
    const targetAltIndex = parseInt(targetRow.dataset.altIndex);

    targetRow.classList.remove('drag-over');

    // Solo se è la stessa alternativa dello stesso pasto
    if (draggedMealType === targetMealType && draggedAlternativeIndex === targetAltIndex && draggedItemId !== targetItemId) {
        reorderMealItems(draggedMealType, draggedAlternativeIndex, draggedItemId, targetItemId);
    }

    return false;
}

/**
 * Gestisce la fine del trascinamento di un elemento
 * Rimuove gli effetti visivi e resetta le variabili di stato del drag
 * @function handleDragEnd
 * @param {DragEvent} e - L'evento di drag end
 */
function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');

    // Rimuovi tutte le classi drag-over
    document.querySelectorAll('.drag-over').forEach(row => {
        row.classList.remove('drag-over');
    });

    draggedElement = null;
    draggedItemId = null;
    draggedMealType = null;
    draggedAlternativeIndex = null;
}

/**
 * Riordina gli alimenti all'interno di un'alternativa di un pasto
 * Sposta un elemento dalla posizione originale alla nuova posizione target
 * @function reorderMealItems
 * @param {string} mealType - Il tipo di pasto
 * @param {number} altIndex - L'indice dell'alternativa
 * @param {number} draggedId - L'ID dell'elemento trascinato
 * @param {number} targetId - L'ID dell'elemento target dove rilasciare
 */
function reorderMealItems(mealType, altIndex, draggedId, targetId) {
    const meals = mealPlan[mealType].alternatives[altIndex];

    const draggedIndex = meals.findIndex(item => item.id === draggedId);
    const targetIndex = meals.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Rimuovi l'elemento dalla posizione originale
    const [draggedItem] = meals.splice(draggedIndex, 1);

    // Inserisci nella nuova posizione
    meals.splice(targetIndex, 0, draggedItem);

    // Re-render della tabella
    renderMealSection(mealType);
}

/**
 * Aggiorna la quantità di un alimento nel piano alimentare
 * Ricalcola tutti i valori nutrizionali in base alla nuova quantità specificata
 * @function updateFoodQuantity
 * @param {string} mealType - Il tipo di pasto
 * @param {number} altIndex - L'indice dell'alternativa
 * @param {number} itemId - L'ID dell'elemento da aggiornare
 * @param {string|number} newQuantity - La nuova quantità in grammi
 */
function updateFoodQuantity(mealType, altIndex, itemId, newQuantity) {
    const quantity = parseFloat(newQuantity);

    if (!quantity || quantity <= 0) {
        showNotification('Inserisci una quantità valida', 'warning');
        renderMealSection(mealType);
        return;
    }

    // Trova l'alimento nell'alternativa specificata
    const mealItem = mealPlan[mealType].alternatives[altIndex].find(item => item.id === itemId);
    if (!mealItem) return;

    // Trova l'alimento nel database per ricalcolare i valori
    const food = foodDatabase.find(f => f.id === mealItem.foodId);
    if (!food) return;

    // Ricalcola i valori nutrizionali con la nuova quantità
    const multiplier = quantity / 100;
    mealItem.quantity = quantity;
    mealItem.calorie = parseFloat((food.calorie * multiplier).toFixed(2));
    mealItem.proteine = parseFloat((food.proteine * multiplier).toFixed(2));
    mealItem.carboidrati = parseFloat((food.carboidrati * multiplier).toFixed(2));
    mealItem.grassi = parseFloat((food.grassi * multiplier).toFixed(2));
    mealItem.fibre = parseFloat((food.fibre * multiplier).toFixed(2));
    mealItem.zuccheri = parseFloat((food.zuccheri * multiplier).toFixed(2));

    // Aggiorna UI
    renderMealSection(mealType);
    updateDailyTotals();
}

/**
 * Rimuove un alimento da un'alternativa di un pasto
 * Aggiorna immediatamente l'UI e i totali giornalieri
 * @function removeFoodFromMeal
 * @param {string} mealType - Il tipo di pasto
 * @param {number} altIndex - L'indice dell'alternativa
 * @param {number} itemId - L'ID dell'elemento da rimuovere
 */
function removeFoodFromMeal(mealType, altIndex, itemId) {
    mealPlan[mealType].alternatives[altIndex] = mealPlan[mealType].alternatives[altIndex].filter(item => item.id !== itemId);
    renderMealSection(mealType);
    updateDailyTotals();
    showNotification('Alimento rimosso', 'info');
}

/**
 * Aggiorna i totali giornalieri per tutte le alternative
 * Calcola e visualizza i totali nutrizionali per ogni alternativa, evidenziando quella attiva e i superamenti dei limiti
 * @function updateDailyTotals
 */
function updateDailyTotals() {
    const container = document.getElementById('dailyTotalsContainer');

    // Trova il numero massimo di alternative
    const maxAlternatives = Math.max(
        mealPlan.colazione.alternatives.length,
        mealPlan.pranzo.alternatives.length,
        mealPlan.cena.alternatives.length,
        mealPlan.spuntini.alternatives.length
    );

    // Ottieni i limiti
    const limits = {
        calorie: parseFloat(document.getElementById('limit-calorie').value) || 0,
        proteine: parseFloat(document.getElementById('limit-proteine').value) || 0,
        carboidrati: parseFloat(document.getElementById('limit-carboidrati').value) || 0,
        grassi: parseFloat(document.getElementById('limit-grassi').value) || 0
    };

    let html = '<div class="grid grid-cols-1 gap-2">';

    // Itera su ogni alternativa
    for (let altIndex = 0; altIndex < maxAlternatives; altIndex++) {
        const altNumber = altIndex + 1;

        // Calcola i totali per questa alternativa
        const totals = {
            calorie: 0,
            proteine: 0,
            carboidrati: 0,
            grassi: 0,
            fibre: 0,
            zuccheri: 0
        };

        // Somma da tutti i pasti
        ['colazione', 'pranzo', 'cena', 'spuntini'].forEach(mealType => {
            const alternative = mealPlan[mealType].alternatives[altIndex];
            if (alternative) {
                alternative.forEach(food => {
                    totals.calorie += food.calorie;
                    totals.proteine += food.proteine;
                    totals.carboidrati += food.carboidrati;
                    totals.grassi += food.grassi;
                    totals.fibre += food.fibre;
                    totals.zuccheri += food.zuccheri;
                });
            }
        });

        // Verifica se è l'alternativa attiva
        const isActive = (
            mealPlan.colazione.active === altIndex ||
            mealPlan.pranzo.active === altIndex ||
            mealPlan.cena.active === altIndex ||
            mealPlan.spuntini.active === altIndex
        );

        // Verifica se supera i limiti
        const exceedsCalorie = limits.calorie > 0 && totals.calorie > limits.calorie;
        const exceedsProteine = limits.proteine > 0 && totals.proteine > limits.proteine;
        const exceedsCarboidrati = limits.carboidrati > 0 && totals.carboidrati > limits.carboidrati;
        const exceedsGrassi = limits.grassi > 0 && totals.grassi > limits.grassi;
        const exceedsAny = exceedsCalorie || exceedsProteine || exceedsCarboidrati || exceedsGrassi;

        // Badge stile
        const badgeClass = isActive ? 'bg-yellow-400 text-yellow-900' : 'bg-white bg-opacity-20 text-white';

        html += `
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-2 ${exceedsAny ? 'ring-2 ring-red-400 bg-red-900 bg-opacity-20' : ''}">
                <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-semibold ${badgeClass} px-1.5 py-0.5 rounded">
                            Alt. ${altNumber}
                        </span>
                        ${isActive ? '<span class="text-xs text-yellow-300">★</span>' : ''}
                        ${exceedsAny ? '<span class="text-xs text-red-300 font-bold">⚠</span>' : ''}
                    </div>
                </div>
                <div class="grid grid-cols-4 md:grid-cols-6 gap-1.5 text-center">
                    <div class="${exceedsCalorie ? 'bg-red-500 bg-opacity-60 ring-1 ring-red-300' : 'bg-white bg-opacity-10'} rounded px-1.5 py-1">
                        <p class="text-xs text-white opacity-60">Cal</p>
                        <p class="text-xs font-bold text-white ${exceedsCalorie ? 'text-red-100' : ''}">${totals.calorie.toFixed(0)}</p>
                    </div>
                    <div class="${exceedsProteine ? 'bg-red-500 bg-opacity-60 ring-1 ring-red-300' : 'bg-white bg-opacity-10'} rounded px-1.5 py-1">
                        <p class="text-xs text-white opacity-60">P</p>
                        <p class="text-xs font-bold text-white ${exceedsProteine ? 'text-red-100' : ''}">${totals.proteine.toFixed(1)}</p>
                    </div>
                    <div class="${exceedsCarboidrati ? 'bg-red-500 bg-opacity-60 ring-1 ring-red-300' : 'bg-white bg-opacity-10'} rounded px-1.5 py-1">
                        <p class="text-xs text-white opacity-60">C</p>
                        <p class="text-xs font-bold text-white ${exceedsCarboidrati ? 'text-red-100' : ''}">${totals.carboidrati.toFixed(1)}</p>
                    </div>
                    <div class="${exceedsGrassi ? 'bg-red-500 bg-opacity-60 ring-1 ring-red-300' : 'bg-white bg-opacity-10'} rounded px-1.5 py-1">
                        <p class="text-xs text-white opacity-60">G</p>
                        <p class="text-xs font-bold text-white ${exceedsGrassi ? 'text-red-100' : ''}">${totals.grassi.toFixed(1)}</p>
                    </div>
                    <div class="bg-white bg-opacity-10 rounded px-1.5 py-1 detailed-column">
                        <p class="text-xs text-white opacity-60">Fi</p>
                        <p class="text-xs font-bold text-white">${totals.fibre.toFixed(1)}</p>
                    </div>
                    <div class="bg-white bg-opacity-10 rounded px-1.5 py-1 detailed-column">
                        <p class="text-xs text-white opacity-60">Zu</p>
                        <p class="text-xs font-bold text-white">${totals.zuccheri.toFixed(1)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Esporta il piano alimentare completo in formato JSON
 * Salva il piano con tutte le alternative, i limiti nutrizionali e le note in un file scaricabile
 * @function exportPlan
 */
function exportPlan() {
    // Verifica se ci sono dati da esportare
    const hasData = Object.values(mealPlan).some(meal =>
        meal.alternatives.some(alt => alt.length > 0)
    );

    if (!hasData) {
        showNotification('Nessun dato da esportare', 'warning');
        return;
    }

    // Salva i limiti massimi impostati dall'utente
    const macroLimits = {
        calorie: parseFloat(document.getElementById('limit-calorie').value) || null,
        proteine: parseFloat(document.getElementById('limit-proteine').value) || null,
        carboidrati: parseFloat(document.getElementById('limit-carboidrati').value) || null,
        grassi: parseFloat(document.getElementById('limit-grassi').value) || null
    };

    const exportData = {
        version: '2.0', // Aggiornata per supportare alternative
        exportDate: new Date().toISOString(),
        mealPlan: mealPlan,
        macroLimits: macroLimits, // Limiti massimi dei macronutrienti
        notes: planNotes // Note al piano alimentare
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `piano-alimentare-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Piano esportato con successo', 'success');
}

/**
 * Importa un piano alimentare da un file JSON
 * Legge il file, valida la struttura, converte formati vecchi e ripristina piano, limiti e note
 * @function importPlan
 * @param {Event} event - L'evento di selezione file dall'input
 * @async
 */
function importPlan(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);

            // Valida struttura JSON
            if (!importData.mealPlan) {
                throw new Error('Formato file non valido');
            }

            // Conferma prima di sovrascrivere
            const hasCurrentData = Object.values(mealPlan).some(meal =>
                meal.alternatives.some(alt => alt.length > 0)
            );
            if (hasCurrentData) {
                if (!confirm('Vuoi sovrascrivere il piano attuale?')) {
                    event.target.value = ''; // Reset input
                    return;
                }
            }

            // Converti vecchio formato (v1.0) al nuovo (v2.0)
            let importedPlan = importData.mealPlan;
            if (importData.version === '1.0' || !importedPlan.colazione.alternatives) {
                importedPlan = {
                    colazione: { alternatives: [importedPlan.colazione || []], active: 0 },
                    pranzo: { alternatives: [importedPlan.pranzo || []], active: 0 },
                    cena: { alternatives: [importedPlan.cena || []], active: 0 },
                    spuntini: { alternatives: [importedPlan.spuntini || []], active: 0 }
                };
            }

            // Importa dati
            mealPlan = importedPlan;

            // Ripristina i limiti massimi se presenti
            if (importData.macroLimits) {
                const limits = importData.macroLimits;
                if (limits.calorie !== null) document.getElementById('limit-calorie').value = limits.calorie;
                if (limits.proteine !== null) document.getElementById('limit-proteine').value = limits.proteine;
                if (limits.carboidrati !== null) document.getElementById('limit-carboidrati').value = limits.carboidrati;
                if (limits.grassi !== null) document.getElementById('limit-grassi').value = limits.grassi;
            }

            // Ripristina le note se presenti
            if (importData.notes) {
                planNotes = importData.notes;
                document.getElementById('planNotes').value = planNotes;
            } else {
                planNotes = '';
                document.getElementById('planNotes').value = '';
            }

            // Aggiorna UI
            renderMealSection('colazione');
            renderMealSection('pranzo');
            renderMealSection('cena');
            renderMealSection('spuntini');
            updateDailyTotals();

            // Mostra i limiti importati se presenti
            let notificationMessage = 'Piano importato con successo';
            if (importData.macroLimits) {
                const limits = importData.macroLimits;
                const limitsText = [];
                if (limits.calorie) limitsText.push(`Cal ${limits.calorie}`);
                if (limits.proteine) limitsText.push(`P ${limits.proteine}g`);
                if (limits.carboidrati) limitsText.push(`C ${limits.carboidrati}g`);
                if (limits.grassi) limitsText.push(`G ${limits.grassi}g`);
                if (limitsText.length > 0) {
                    notificationMessage += ` - Limiti: ${limitsText.join(', ')}`;
                }
            }

            showNotification(notificationMessage, 'success');
        } catch (error) {
            console.error('Errore import:', error);
            showNotification('Errore nell\'importazione del file', 'error');
        }

        // Reset input per permettere reimportazione dello stesso file
        event.target.value = '';
    };

    reader.readAsText(file);
}

/**
 * Cancella tutti i pasti e resetta il piano alimentare
 * Chiede conferma all'utente prima di eliminare tutti i dati e ripristina lo stato iniziale
 * @function clearAllMeals
 */
function clearAllMeals() {
    const hasData = Object.values(mealPlan).some(meal =>
        meal.alternatives.some(alt => alt.length > 0)
    );

    if (!hasData) {
        showNotification('Non ci sono dati da cancellare', 'info');
        return;
    }

    if (!confirm('Sei sicuro di voler cancellare tutto il piano alimentare?')) {
        return;
    }

    mealPlan = {
        colazione: { alternatives: [[]], active: 0 },
        pranzo: { alternatives: [[]], active: 0 },
        cena: { alternatives: [[]], active: 0 },
        spuntini: { alternatives: [[]], active: 0 }
    };

    renderMealSection('colazione');
    renderMealSection('pranzo');
    renderMealSection('cena');
    renderMealSection('spuntini');
    updateDailyTotals();

    showNotification('Piano alimentare cancellato', 'info');
}

/**
 * Genera e stampa una versione PDF del piano alimentare
 * Crea un layout print-friendly con tutte le alternative, totali giornalieri e note
 * @function printPDF
 */
function printPDF() {
    // Verifica se ci sono dati da stampare
    const hasData = Object.values(mealPlan).some(meal =>
        meal.alternatives.some(alt => alt.length > 0)
    );

    if (!hasData) {
        showNotification('Nessun dato da stampare', 'warning');
        return;
    }

    // Crea una finestra di stampa con contenuto print-friendly
    const printWindow = document.createElement('div');
    printWindow.id = 'printContent';
    printWindow.className = 'print-content';

    let html = ``;

    const mealNames = {
        colazione: 'Colazione',
        pranzo: 'Pranzo',
        cena: 'Cena',
        spuntini: 'Spuntini'
    };

    const mealColors = {
        colazione: '#f59e0b',
        pranzo: '#10b981',
        cena: '#6366f1',
        spuntini: '#f43f5e'
    };

    // Itera su ogni pasto
    Object.keys(mealNames).forEach(mealType => {
        const meal = mealPlan[mealType];

        html += `
            <div class="print-meal-section">
                <h2 class="print-meal-title" style="background-color: ${mealColors[mealType]}">
                    ${mealNames[mealType]}
                </h2>
        `;

        // Itera su tutte le alternative
        meal.alternatives.forEach((alternative, altIndex) => {
            if (alternative.length === 0) return; // Salta alternative vuote

            const altNumber = altIndex + 1;
            const isActive = altIndex === meal.active;

            html += `
                <div class="print-alternative ${isActive ? 'active-alternative' : ''}">
                    <h3 class="print-alternative-title">
                        Alternativa ${altNumber}
                    </h3>
                    <table class="print-table">
                        <thead>
                            <tr>
                                <th>Alimento</th>
                                <th>Quantità</th>
                                <th>Calorie</th>
                                <th>Proteine</th>
                                <th>Carb.</th>
                                <th>Grassi</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // Aggiungi ogni alimento dell'alternativa
            alternative.forEach((food, foodIndex) => {
                // Colori alternati con gradiente basato sul colore del pasto
                const bgColor = foodIndex % 2 === 0
                    ? `style="background: linear-gradient(to right, ${mealColors[mealType]}15, ${mealColors[mealType]}08);"`
                    : '';
                html += `
                    <tr ${bgColor}>
                        <td>${food.nome}</td>
                        <td>${food.quantity.toFixed(0)}g</td>
                        <td>${food.calorie.toFixed(1)}</td>
                        <td>${food.proteine.toFixed(1)}g</td>
                        <td>${food.carboidrati.toFixed(1)}g</td>
                        <td>${food.grassi.toFixed(1)}g</td>
                    </tr>
                `;
            });

            // Calcola totali dell'alternativa
            const totals = alternative.reduce((acc, food) => {
                return {
                    calorie: acc.calorie + food.calorie,
                    proteine: acc.proteine + food.proteine,
                    carboidrati: acc.carboidrati + food.carboidrati,
                    grassi: acc.grassi + food.grassi
                };
            }, { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 });

            html += `
                        </tbody>
                        <tfoot>
                            <tr class="print-totals">
                                <td colspan="2"><strong>Totale Alternativa</strong></td>
                                <td><strong>${totals.calorie.toFixed(1)}</strong></td>
                                <td><strong>${totals.proteine.toFixed(1)}g</strong></td>
                                <td><strong>${totals.carboidrati.toFixed(1)}g</strong></td>
                                <td><strong>${totals.grassi.toFixed(1)}g</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        });

        html += `</div>`; // Chiudi print-meal-section
    });

    // Ottieni i limiti massimi
    const limits = {
        calorie: parseFloat(document.getElementById('limit-calorie').value) || 0,
        proteine: parseFloat(document.getElementById('limit-proteine').value) || 0,
        carboidrati: parseFloat(document.getElementById('limit-carboidrati').value) || 0,
        grassi: parseFloat(document.getElementById('limit-grassi').value) || 0
    };

    // Calcola totali giornalieri per TUTTE le alternative
    const maxAlternatives = Math.max(...Object.values(mealPlan).map(m => m.alternatives.length));
    const alternativesTotals = [];

    for (let altIndex = 0; altIndex < maxAlternatives; altIndex++) {
        const totals = {
            calorie: 0,
            proteine: 0,
            carboidrati: 0,
            grassi: 0
        };

        Object.keys(mealPlan).forEach(mealType => {
            const alternative = mealPlan[mealType].alternatives[altIndex];
            if (alternative) {
                alternative.forEach(food => {
                    totals.calorie += food.calorie;
                    totals.proteine += food.proteine;
                    totals.carboidrati += food.carboidrati;
                    totals.grassi += food.grassi;
                });
            }
        });

        alternativesTotals.push(totals);
    }

    // Sezione totali giornalieri
    html += `
        <div class="print-daily-totals">
            <h2>Totali Giornalieri per Alternativa</h2>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>Alternativa</th>
                        <th>Calorie</th>
                        <th>Proteine</th>
                        <th>Carboidrati</th>
                        <th>Grassi</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Aggiungi riga per ogni alternativa
    alternativesTotals.forEach((totals, index) => {
        const altNumber = index + 1;
        const isActive = Object.values(mealPlan).some(m => m.active === index);

        // Controlla se supera i limiti
        const exceedsCalorie = limits.calorie > 0 && totals.calorie > limits.calorie;
        const exceedsProteine = limits.proteine > 0 && totals.proteine > limits.proteine;
        const exceedsCarboidrati = limits.carboidrati > 0 && totals.carboidrati > limits.carboidrati;
        const exceedsGrassi = limits.grassi > 0 && totals.grassi > limits.grassi;

        html += `
            <tr class="${isActive ? 'print-totals' : ''}" style="${isActive ? 'background: linear-gradient(to right, #4f46e515, #7c3aed08);' : ''}">
                <td><strong>Alt. ${altNumber}${isActive ? ' ★' : ''}</strong></td>
                <td style="${exceedsCalorie ? 'color: #dc2626; font-weight: bold;' : ''}">
                    ${totals.calorie.toFixed(1)}
                </td>
                <td style="${exceedsProteine ? 'color: #dc2626; font-weight: bold;' : ''}">
                    ${totals.proteine.toFixed(1)}g
                </td>
                <td style="${exceedsCarboidrati ? 'color: #dc2626; font-weight: bold;' : ''}">
                    ${totals.carboidrati.toFixed(1)}g
                </td>
                <td style="${exceedsGrassi ? 'color: #dc2626; font-weight: bold;' : ''}">
                    ${totals.grassi.toFixed(1)}g
                </td>
            </tr>
        `;
    });

    // Aggiungi riga dei limiti
    if (limits.calorie > 0 || limits.proteine > 0 || limits.carboidrati > 0 || limits.grassi > 0) {
        html += `
            <tr style="background: linear-gradient(to right, #fef3c7, #fde68a); border-top: 3px solid #f59e0b;">
                <td><strong>LIMITI MASSIMI</strong></td>
                <td><strong>${limits.calorie > 0 ? limits.calorie.toFixed(0) : '-'}</strong></td>
                <td><strong>${limits.proteine > 0 ? limits.proteine.toFixed(0) + 'g' : '-'}</strong></td>
                <td><strong>${limits.carboidrati > 0 ? limits.carboidrati.toFixed(0) + 'g' : '-'}</strong></td>
                <td><strong>${limits.grassi > 0 ? limits.grassi.toFixed(0) + 'g' : '-'}</strong></td>
            </tr>
        `;
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    // Aggiungi sezione note se presenti
    if (planNotes && planNotes.trim() !== '') {
        html += `
            <div class="print-notes" style="margin-top: 30px; padding: 20px; background: linear-gradient(to right, #f0f9ff, #e0f2fe); border-left: 4px solid #0ea5e9; border-radius: 8px;">
                <h2 style="color: #0c4a6e; font-size: 18px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                    <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Note
                </h2>
                <p style="color: #0c4a6e; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${planNotes}</p>
            </div>
        `;
    }

    printWindow.innerHTML = html;
    document.body.appendChild(printWindow);

    // Stampa
    window.print();

    // Rimuovi il contenuto dopo la stampa
    setTimeout(() => {
        document.body.removeChild(printWindow);
    }, 100);
}

/**
 * Salva le note del piano alimentare nella variabile globale
 * Acquisisce il testo dalla textarea e lo memorizza per l'esportazione
 * @function savePlanNotes
 */
function savePlanNotes() {
    planNotes = document.getElementById('planNotes').value;
}

/**
 * Attiva o disattiva la visibilità della barra dei totali giornalieri
 * Mostra/nasconde la barra fissa in basso e aggiorna l'icona e il testo del pulsante
 * @function toggleDailyTotalsBar
 */
function toggleDailyTotalsBar() {
    const bar = document.getElementById('dailyTotalsBar');
    const toggleBtn = document.getElementById('toggleTotalsBtn');
    const toggleText = document.getElementById('toggleText');
    const toggleIcon = document.getElementById('toggleIcon');

    if (bar.style.display === 'none') {
        // Mostra la barra
        bar.style.display = 'block';
        toggleBtn.style.bottom = '0';
        toggleBtn.style.borderRadius = '8px 8px 0 0';
        toggleText.textContent = 'Nascondi Totali';
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>';
        // Ripristina il padding del body
        document.body.style.paddingBottom = window.innerWidth >= 768 ? '400px' : '450px';
    } else {
        // Nascondi la barra
        bar.style.display = 'none';
        toggleBtn.style.bottom = '16px';
        toggleBtn.style.borderRadius = '8px';
        toggleText.textContent = 'Mostra Totali';
        toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>';
        // Rimuovi il padding del body quando la barra è nascosta
        document.body.style.paddingBottom = '80px';
    }
}

/**
 * Mostra una notifica temporanea all'utente
 * Crea un toast colorato in base al tipo di messaggio che scompare automaticamente dopo 3 secondi
 * @function showNotification
 * @param {string} message - Il messaggio da visualizzare
 * @param {string} [type='info'] - Il tipo di notifica (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Colori per tipo di notifica
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Apre il modal per aggiungere un nuovo alimento al database
 * Rimuove la classe hidden dal modal per renderlo visibile
 * @function openAddFoodModal
 */
function openAddFoodModal() {
    document.getElementById('addFoodModal').classList.remove('hidden');
}

/**
 * Chiude il modal per l'aggiunta di un nuovo alimento
 * Nasconde il modal e resetta il form ai valori di default
 * @function closeAddFoodModal
 */
function closeAddFoodModal() {
    document.getElementById('addFoodModal').classList.add('hidden');
    document.getElementById('addFoodForm').reset();
}

/**
 * Configura il form per l'aggiunta di nuovi alimenti al database
 * Gestisce il submit del form, invia i dati all'API e aggiorna il database degli alimenti
 * @function setupAddFoodForm
 * @async
 */
function setupAddFoodForm() {
    const form = document.getElementById('addFoodForm');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const foodData = {
            nome: document.getElementById('new-food-nome').value,
            categoria: document.getElementById('new-food-categoria').value,
            calorie: parseFloat(document.getElementById('new-food-calorie').value),
            proteine: parseFloat(document.getElementById('new-food-proteine').value),
            carboidrati: parseFloat(document.getElementById('new-food-carboidrati').value),
            grassi: parseFloat(document.getElementById('new-food-grassi').value),
            fibre: parseFloat(document.getElementById('new-food-fibre').value) || 0,
            zuccheri: parseFloat(document.getElementById('new-food-zuccheri').value) || 0
        };

        try {
            const response = await fetch('includes/add_food.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(foodData)
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Alimento aggiunto con successo al database', 'success');
                closeAddFoodModal();
                // Ricarica il database degli alimenti
                loadFoodDatabase();
            } else {
                showNotification(result.message || 'Errore durante il salvataggio', 'error');
            }
        } catch (error) {
            console.error('Errore:', error);
            showNotification('Errore di connessione al server', 'error');
        }
    });
}
