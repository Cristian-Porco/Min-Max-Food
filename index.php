<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Min Max Food</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="bg-gray-50">
    <!-- Header Compatto -->
    <header class="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg mb-6 sticky top-0 z-50">
        <div class="w-full px-4 py-4">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <!-- Titolo -->
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-white">Min Max Food</h1>
                </div>

                <!-- Pulsanti Import/Export -->
                <div class="flex flex-wrap gap-2 items-center">
                    <button onclick="exportPlan()" class="bg-white hover:bg-gray-100 text-indigo-600 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-md">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Esporta
                    </button>
                    <div>
                        <input type="file" id="importFile" accept=".json" class="hidden" onchange="importPlan(event)">
                        <button onclick="document.getElementById('importFile').click()" class="bg-white hover:bg-gray-100 text-green-600 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-md">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                            Importa
                        </button>
                    </div>
                    <button onclick="printPDF()" class="bg-white hover:bg-gray-100 text-purple-600 font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-md">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        Stampa PDF
                    </button>
                    <button onclick="clearAllMeals()" class="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-md">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Cancella
                    </button>

                    <!-- Separatore -->
                    <div class="h-8 w-px bg-white bg-opacity-30 hidden md:block"></div>

                    <!-- Pulsante Aggiungi Alimento al DB -->
                    <button onclick="openAddFoodModal()" class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-md">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Nuovo Alimento
                    </button>

                    <!-- Separatore -->
                    <div class="h-8 w-px bg-white bg-opacity-30 hidden md:block"></div>

                    <!-- Checkbox Vista Dettagliata -->
                    <label class="flex items-center gap-2 cursor-pointer bg-white bg-opacity-10 hover:bg-opacity-20 px-3 py-2 rounded-lg transition">
                        <input type="checkbox" id="showDetailedColumns" onchange="toggleDetailedColumns()" class="rounded text-white focus:ring-white">
                        <span class="text-white text-sm font-medium">Mostra Dettagli</span>
                    </label>
                </div>
            </div>
        </div>
    </header>

    <div class="w-full pb-8">
        <!-- Layout a due colonne -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
            <!-- Colonna Sinistra - Piano Alimentare (2/3) -->
            <div class="lg:col-span-2">

        <!-- Pasti -->
        <div class="space-y-6">
            <!-- Colazione -->
            <div class="meal-section">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="bg-amber-500 px-6 py-4">
                        <h2 class="text-2xl font-semibold text-white">Colazione</h2>
                    </div>
                    <div class="p-6" id="colazioneContainer">
                        <!-- Contenuto generato dinamicamente da renderMealSection() -->
                    </div>
                </div>
            </div>

            <!-- Pranzo -->
            <div class="meal-section">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="bg-emerald-500 px-6 py-4">
                        <h2 class="text-2xl font-semibold text-white">Pranzo</h2>
                    </div>
                    <div class="p-6" id="pranzoContainer">
                        <!-- Contenuto generato dinamicamente da renderMealSection() -->
                    </div>
                </div>
            </div>

            <!-- Cena -->
            <div class="meal-section">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="bg-indigo-500 px-6 py-4">
                        <h2 class="text-2xl font-semibold text-white">Cena</h2>
                    </div>
                    <div class="p-6" id="cenaContainer">
                        <!-- Contenuto generato dinamicamente da renderMealSection() -->
                    </div>
                </div>
            </div>

            <!-- Spuntini -->
            <div class="meal-section">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="bg-rose-500 px-6 py-4">
                        <h2 class="text-2xl font-semibold text-white">Spuntini</h2>
                    </div>
                    <div class="p-6" id="spuntiniContainer">
                        <!-- Contenuto generato dinamicamente da renderMealSection() -->
                    </div>
                </div>
            </div>
        </div>
            </div>
            <!-- Fine Colonna Sinistra -->

            <!-- Colonna Destra - Form Aggiunta Alimento (1/3) -->
            <div class="lg:col-span-1">
                <div class="sticky-sidebar">
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Aggiungi Alimento
                        </h2>

                        <!-- Form aggiunta alimento -->
                        <div class="space-y-4">
                            <!-- Seleziona Alimento -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Seleziona Alimento</label>
                                <select id="foodSelect" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm">
                                    <option value="">-- Seleziona un alimento --</option>
                                </select>
                            </div>

                            <!-- Quantità -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Quantità (g)</label>
                                <input type="number" id="quantityInput" value="100" min="1" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            </div>

                            <!-- Pasto -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Pasto</label>
                                <select id="mealSelect" onchange="updateAlternativeSelect()" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <option value="colazione">Colazione</option>
                                    <option value="pranzo">Pranzo</option>
                                    <option value="cena">Cena</option>
                                    <option value="spuntini">Spuntini</option>
                                </select>
                            </div>

                            <!-- Alternativa -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Alternativa</label>
                                <select id="alternativeSelect" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                    <!-- Popolato dinamicamente -->
                                </select>
                            </div>

                            <!-- Info nutrizionali alimento selezionato (compatte) -->
                            <div id="foodInfo" class="hidden border-t pt-3">
                                <h3 class="text-xs font-semibold text-gray-700 mb-2">Anteprima Valori (<span id="previewQuantita">100</span>g)</h3>

                                <!-- Layout compatto -->
                                <div class="bg-gray-50 rounded-lg p-2">
                                    <div class="grid grid-cols-4 gap-1 text-center mb-1">
                                        <div class="bg-blue-100 rounded px-1 py-1">
                                            <p class="text-xs text-gray-500">Cal</p>
                                            <p class="text-xs font-bold text-blue-700"><span id="previewCalorie">0</span></p>
                                        </div>
                                        <div class="bg-green-100 rounded px-1 py-1">
                                            <p class="text-xs text-gray-500">P</p>
                                            <p class="text-xs font-bold text-green-700"><span id="previewProteine">0</span>g</p>
                                        </div>
                                        <div class="bg-yellow-100 rounded px-1 py-1">
                                            <p class="text-xs text-gray-500">C</p>
                                            <p class="text-xs font-bold text-yellow-700"><span id="previewCarboidrati">0</span>g</p>
                                        </div>
                                        <div class="bg-red-100 rounded px-1 py-1">
                                            <p class="text-xs text-gray-500">G</p>
                                            <p class="text-xs font-bold text-red-700"><span id="previewGrassi">0</span>g</p>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-1 text-center detailed-column">
                                        <div class="bg-purple-100 rounded px-1 py-1">
                                            <p class="text-xs text-gray-500">Fibre</p>
                                            <p class="text-xs font-bold text-purple-700"><span id="previewFibre">0</span>g</p>
                                        </div>
                                        <div class="bg-pink-100 rounded px-1 py-1">
                                            <p class="text-xs text-gray-500">Zucch</p>
                                            <p class="text-xs font-bold text-pink-700"><span id="previewZuccheri">0</span>g</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Pulsante Aggiungi -->
                            <button onclick="addFoodToMeal()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-md">
                                Aggiungi
                            </button>
                        </div>
                    </div>

                    <!-- Sezione Note -->
                    <div class="p-6">
                        <h2 class="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Note
                        </h2>
                        <textarea id="planNotes" rows="5" placeholder="Inserisci note, osservazioni o indicazioni per il piano alimentare..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" oninput="savePlanNotes()"></textarea>
                        <p class="text-xs text-gray-500 mt-2">Le note verranno salvate automaticamente e incluse nell'esportazione e nella stampa PDF</p>
                    </div>
                </div>
            </div>
            <!-- Fine Colonna Destra -->
        </div>
    </div>

    <!-- Pulsante Toggle Barra Totali (sempre visibile) -->
    <button id="toggleTotalsBtn" onclick="toggleDailyTotalsBar()" class="fixed right-4 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-800 hover:to-blue-800 text-white font-medium px-4 py-2 shadow-lg transition-all flex items-center gap-2" style="bottom: 16px; z-index: 50; border-radius: 8px;">
        <svg id="toggleIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
        </svg>
        <span id="toggleText">Mostra Totali</span>
    </button>

    <!-- Barra Totali Giornalieri Fissa (nascosta di default) -->
    <div id="dailyTotalsBar" class="daily-totals-bar bg-gradient-to-r from-purple-600 to-blue-600 bg-opacity-95" style="display: none;">
        <div class="w-full px-4 py-4">
            <!-- Limiti Massimi (più grandi e prominenti) -->
            <div class="mb-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <h3 class="text-sm font-semibold text-white mb-3 text-center">LIMITI MASSIMI GIORNALIERI</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                        <label class="block text-xs text-white opacity-90 mb-2">Calorie (kcal)</label>
                        <input type="number" id="limit-calorie" placeholder="es. 2500" min="0" step="10" class="w-full bg-white bg-opacity-30 text-white placeholder-white placeholder-opacity-50 border-2 border-white border-opacity-40 rounded-lg px-3 py-2 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-40" onchange="updateDailyTotals()">
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                        <label class="block text-xs text-white opacity-90 mb-2">Proteine (g)</label>
                        <input type="number" id="limit-proteine" placeholder="es. 150" min="0" step="5" class="w-full bg-white bg-opacity-30 text-white placeholder-white placeholder-opacity-50 border-2 border-white border-opacity-40 rounded-lg px-3 py-2 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-40" onchange="updateDailyTotals()">
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                        <label class="block text-xs text-white opacity-90 mb-2">Carboidrati (g)</label>
                        <input type="number" id="limit-carboidrati" placeholder="es. 300" min="0" step="5" class="w-full bg-white bg-opacity-30 text-white placeholder-white placeholder-opacity-50 border-2 border-white border-opacity-40 rounded-lg px-3 py-2 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-40" onchange="updateDailyTotals()">
                    </div>
                    <div class="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                        <label class="block text-xs text-white opacity-90 mb-2">Grassi (g)</label>
                        <input type="number" id="limit-grassi" placeholder="es. 80" min="0" step="5" class="w-full bg-white bg-opacity-30 text-white placeholder-white placeholder-opacity-50 border-2 border-white border-opacity-40 rounded-lg px-3 py-2 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-white focus:bg-opacity-40" onchange="updateDailyTotals()">
                    </div>
                </div>
            </div>

            <!-- Totali per Alternativa (compatti) -->
            <div>
                <h3 class="text-xs font-medium text-white opacity-75 mb-2">Totali per Alternativa</h3>
                <div id="dailyTotalsContainer" class="overflow-y-auto" style="max-height: 200px;">
                    <!-- Le alternative saranno inserite qui dinamicamente -->
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Aggiungi Alimento al Database -->
    <div id="addFoodModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex justify-between items-center sticky top-0">
                <h2 class="text-2xl font-bold text-white">Aggiungi Nuovo Alimento</h2>
                <button onclick="closeAddFoodModal()" class="text-white hover:text-gray-200 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <form id="addFoodForm" class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Nome -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nome Alimento *</label>
                        <input type="text" id="new-food-nome" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>

                    <!-- Categoria -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                        <select id="new-food-categoria" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                            <option value="">-- Seleziona Categoria --</option>
                            <option value="Cereali">Cereali</option>
                            <option value="Carne">Carne</option>
                            <option value="Pesce">Pesce</option>
                            <option value="Latticini">Latticini</option>
                            <option value="Uova">Uova</option>
                            <option value="Legumi">Legumi</option>
                            <option value="Frutta secca">Frutta secca</option>
                            <option value="Frutta">Frutta</option>
                            <option value="Verdure">Verdure</option>
                            <option value="Condimenti">Condimenti</option>
                            <option value="Altro">Altro</option>
                        </select>
                    </div>

                    <!-- Valori Nutrizionali per 100g -->
                    <div class="md:col-span-2">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Valori Nutrizionali (per 100g)</h3>
                    </div>

                    <!-- Calorie -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Calorie (kcal) *</label>
                        <input type="number" id="new-food-calorie" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>

                    <!-- Proteine -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Proteine (g) *</label>
                        <input type="number" id="new-food-proteine" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>

                    <!-- Carboidrati -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Carboidrati (g) *</label>
                        <input type="number" id="new-food-carboidrati" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>

                    <!-- Grassi -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Grassi (g) *</label>
                        <input type="number" id="new-food-grassi" step="0.01" min="0" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>

                    <!-- Fibre -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Fibre (g)</label>
                        <input type="number" id="new-food-fibre" step="0.01" min="0" value="0" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>

                    <!-- Zuccheri -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Zuccheri (g)</label>
                        <input type="number" id="new-food-zuccheri" step="0.01" min="0" value="0" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                    </div>
                </div>

                <!-- Pulsanti -->
                <div class="flex gap-3 mt-6 pt-4 border-t">
                    <button type="button" onclick="closeAddFoodModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-3 rounded-lg transition">
                        Annulla
                    </button>
                    <button type="submit" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-3 rounded-lg transition">
                        Salva Alimento
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script src="assets/js/app.js"></script>
</body>
</html>
