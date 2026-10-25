document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tm-form');
    if (!form) return;

    const btnGenerate = document.getElementById('tm-generate');
    const resultContainer = document.getElementById('tm-result-container');
    const visualResult = document.getElementById('tm-visual-result');
    const resultMarkdown = document.getElementById('tm-result-markdown');
    const btnCopy = document.getElementById('tm-copy');

    btnGenerate.addEventListener('click', () => {
        const q1Val = document.getElementById('q1').value;
        const q2Val = document.getElementById('q2').value;
        const q3Val = document.getElementById('q3').value;
        const q4Val = document.getElementById('q4').value;
        const q5Val = document.getElementById('q5').value;

        if (!q1Val || !q2Val || !q3Val || !q4Val || !q5Val) {
            visualResult.innerHTML = `<div class="admonition warning"><p class="admonition-title">Brakujące dane</p><p>Aby wygenerować raport, musisz odpowiedzieć na wszystkie pięć pytań.</p></div>`;
            resultContainer.style.display = 'none';
            return;
        }

        const asset = parseInt(q1Val);
        const adversary = parseInt(q2Val);
        const prob = parseInt(q3Val);
        const impact = parseInt(q4Val);
        const friction = parseInt(q5Val);

        const getLabel = (id) => document.getElementById(id).options[document.getElementById(id).selectedIndex].text;
        const labels = {
            asset: getLabel('q1'),
            adversary: getLabel('q2'),
            prob: getLabel('q3'),
            impact: getLabel('q4'),
            friction: getLabel('q5')
        };

        // --- 1. OBLICZANIE RYZYKA (OWASP) ---
        const likelihood = (adversary + prob) / 2;
        const riskScore = likelihood * impact; // Skala 1.0 - 16.0

        // --- 2. USTALANIE WYMAGANEGO TARCIA ---
        let requiredFriction = 1;
        if (riskScore > 12 || asset >= 4) {
            requiredFriction = 4; // Klucz sprzętowy / Cold storage
        } else if (riskScore > 8 || asset >= 3) {
            requiredFriction = 3; // Aplikacja 2FA / Dodatkowe hasło
        } else if (riskScore > 4) {
            requiredFriction = 2; // Silne hasło / PIN
        }

        let hasCriticalError = false;
        let hasWarning = false;
        let advice = [];

        let reportMd = `### 🛡️ Twój Model Zagrożeń\n\n`;
        reportMd += `**Twoje założenia:**\n`;
        reportMd += `- **Chronię:** ${labels.asset}\n`;
        reportMd += `- **Przed kim:** ${labels.adversary}\n`;
        reportMd += `- **Ryzyko:** ${labels.prob}\n`;
        reportMd += `- **Skutki:** ${labels.impact}\n`;
        reportMd += `- **Akceptowane tarcie:** ${labels.friction}\n\n`;
        reportMd += `**Wskaźnik ryzyka:** ${riskScore.toFixed(1)} / 16.0 | **Wymagane tarcie:** min. ${requiredFriction}\n\n`;
        reportMd += `---\n\n### 🔍 Analiza OPSEC:\n\n`;

        let analysisHtml = `<h3>🔍 Analiza OPSEC:</h3>`;

        // FUNDAMENT 1: Najsłabsze ogniwo (Under-defending)
        if (friction < requiredFriction) {
            reportMd += `!!! failure "1. Zasada najsłabszego ogniwa: NARUSZONA"\n    Twoje ryzyko wymaga tarcia na poziomie ${requiredFriction}, a wybrałeś ${friction}. Twoje zabezpieczenia są niewystarczające.\n\n`;
            analysisHtml += `<div class="admonition failure"><p class="admonition-title">1. Zasada najsłabszego ogniwa: NARUSZONA</p><p>Twoje ryzyko wymaga tarcia na poziomie ${requiredFriction}, a wybrałeś ${friction}. Twoje zabezpieczenia są niewystarczające.</p></div>`;
            hasCriticalError = true;
            advice.push(`Zwiększ tarcie do poziomu ${requiredFriction} (np. włącz 2FA).`);
        } else {
            reportMd += `!!! success "1. Zasada najsłabszego ogniwa: ZALICZONA"\n    Poziom zabezpieczeń jest adekwatny do ryzyka.\n\n`;
            analysisHtml += `<div class="admonition success"><p class="admonition-title">1. Zasada najsłabszego ogniwa: ZALICZONA</p><p>Poziom zabezpieczeń jest adekwatny do ryzyka.</p></div>`;
        }

        // FUNDAMENT 2: Minimalizm (Over-defending)
        if (friction > requiredFriction + 1) {
            reportMd += `!!! failure "2. Minimalizm (KISS): NARUSZONA"\n    Wdrażasz tarcie na poziomie ${friction} przy ryzyku wymagającym ${requiredFriction}. To niepotrzebna złożoność, która może Cię zniechęcić.\n\n`;
            analysisHtml += `<div class="admonition failure"><p class="admonition-title">2. Minimalizm (KISS): NARUSZONA</p><p>Wdrażasz tarcie na poziomie ${friction} przy ryzyku wymagającym ${requiredFriction}. To niepotrzebna złożoność, która może Cię zniechęcić.</p></div>`;
            hasCriticalError = true;
            advice.push("Zmniejsz poziom skomplikowania, nie wdrażaj niepotrzebnych zabezpieczeń.");
        } else {
            // Tutaj zmieniono komunikat, aby nie kłócił się z błędem w Fundamencie 1
            reportMd += `!!! success "2. Minimalizm (KISS): ZALICZONA"\n    Brak zbędnej złożoności. Nie wdrażasz niepotrzebnych, ciężkich zabezpieczeń.\n\n`;
            analysisHtml += `<div class="admonition success"><p class="admonition-title">2. Minimalizm (KISS): ZALICZONA</p><p>Brak zbędnej złożoności. Nie wdrażasz niepotrzebnych, ciężkich zabezpieczeń.</p></div>`;
        }

        // FUNDAMENT 3: Świadome zaufanie
        if (asset >= 3 && friction === 1) {
            reportMd += `!!! failure "3. Świadome zaufanie: NARUSZONA"\n    Chronisz krytyczne dane przy zerowym tarciu. Ślepo ufasz domyślnym ustawieniom, co jest sprzeczne z filozofią Distrust.\n\n`;
            analysisHtml += `<div class="admonition failure"><p class="admonition-title">3. Świadome zaufanie: NARUSZONA</p><p>Chronisz krytyczne dane przy zerowym tarciu. Ślepo ufasz domyślnym ustawieniom, co jest sprzeczne z filozofią Distrust.</p></div>`;
            hasCriticalError = true;
        } else {
            reportMd += `!!! success "3. Świadome zaufanie: ZALICZONA"\n    Twoje decyzje opierają się na świadomym wyborze.\n\n`;
            analysisHtml += `<div class="admonition success"><p class="admonition-title">3. Świadome zaufanie: ZALICZONA</p><p>Twoje decyzje opierają się na świadomym wyborze.</p></div>`;
        }

        // FUNDAMENT 4: Ewolucja
        if (adversary >= 3 && friction < 3) {
            reportMd += `!!! warning "4. Ewolucja: DO POPRAWY"\n    Deklarujesz ochronę przed zaawansowanym adwersarzem, ale nie akceptujesz wystarczającego tarcia (wymagane min. 3). Twoje zabezpieczenia są zbyt statyczne.\n\n`;
            analysisHtml += `<div class="admonition warning"><p class="admonition-title">4. Ewolucja: DO POPRAWY</p><p>Deklarujesz ochronę przed zaawansowanym adwersarzem, ale nie akceptujesz wystarczającego tarcia (wymagane min. 3). Twoje zabezpieczenia są zbyt statyczne.</p></div>`;
            hasWarning = true;
        } else {
            reportMd += `!!! success "4. Ewolucja: ZALICZONA"\n    Twój model uwzględnia potrzebę adaptacji.\n\n`;
            analysisHtml += `<div class="admonition success"><p class="admonition-title">4. Ewolucja: ZALICZONA</p><p>Twój model uwzględnia potrzebę adaptacji.</p></div>`;
        }

        // WERDYKT
        reportMd += `---\n\n### 📋 Werdykt\n`;
        let finalHtml = `<hr><h3>📋 Werdykt</h3>`;

        if (!hasCriticalError && !hasWarning) {
            reportMd += `!!! success "PEŁNA SPÓJNOŚĆ"\n    Twój model zagrożeń jest logiczny i adekwatny. Możesz czuć się bezpiecznie.`;
            finalHtml += `<div class="admonition success"><p class="admonition-title">PEŁNA SPÓJNOŚĆ</p><p>Twój model zagrożeń jest logiczny i adekwatny. Możesz czuć się bezpiecznie.</p></div>`;
        } else if (!hasCriticalError && hasWarning) {
            reportMd += `!!! warning "WYMAGA POPRAWY"\n    Twój model ma drobne luki w elastyczności.`;
            finalHtml += `<div class="admonition warning"><p class="admonition-title">WYMAGA POPRAWY</p><p>Twój model ma drobne luki w elastyczności.</p></div>`;
        } else {
            reportMd += `!!! failure "KRYTYCZNE NIESPÓJNOŚCI"\n    Twój model jest wewnętrznie sprzeczny. Twoje bezpieczeństwo może być iluzją.\n\n`;
            finalHtml += `<div class="admonition failure"><p class="admonition-title">KRYTYCZNE NIESPÓJNOŚCI</p><p>Twój model jest wewnętrznie sprzeczny. Twoje bezpieczeństwo może być iluzją.</p>`;
            
            // Dodawanie konkretnych porad
            if (advice.length > 0) {
                reportMd += `**Co powinieneś zrobić:**\n`;
                finalHtml += `<p><strong>Co powinieneś zrobić:</strong></p><ul>`;
                advice.forEach(tip => {
                    reportMd += `- ${tip}\n`;
                    finalHtml += `<li>${tip}</li>`;
                });
                finalHtml += `</ul>`;
            }
            finalHtml += `</div>`;
        }

        visualResult.innerHTML = analysisHtml + finalHtml;
        resultMarkdown.value = reportMd;
        resultContainer.style.display = 'block';
    });

    btnCopy.addEventListener('click', () => {
        resultMarkdown.select();
        document.execCommand('copy');
        const originalText = btnCopy.textContent;
        btnCopy.textContent = 'Skopiowano!';
        setTimeout(() => { btnCopy.textContent = originalText; }, 2000);
    });
});
