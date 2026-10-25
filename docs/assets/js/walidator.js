document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tm-form');
    if (!form) return;

    const btnGenerate = document.getElementById('tm-generate');
    const resultContainer = document.getElementById('tm-result-container');
    const resultMarkdown = document.getElementById('tm-result-markdown');
    const btnCopy = document.getElementById('tm-copy');

    btnGenerate.addEventListener('click', () => {
        // --- NOWY KOD: Sprawdzanie, czy wszystkie pytania mają odpowiedzi ---
        const q1Val = document.getElementById('q1').value;
        const q2Val = document.getElementById('q2').value;
        const q3Val = document.getElementById('q3').value;
        const q4Val = document.getElementById('q4').value;
        const q5Val = document.getElementById('q5').value;

        if (!q1Val || !q2Val || !q3Val || !q4Val || !q5Val) {
            resultMarkdown.value = "Aby wygenerować raport, musisz odpowiedzieć na wszystkie pięć pytań. Wybierz opcje z list rozwijanych powyżej.";
            resultContainer.style.display = 'block';
            return; // Zatrzymujemy działanie skryptu
        }
        // -------------------------------------------------------------------

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

        let riskScore = (asset + adversary + prob + impact) / 4;
        let passed = 0;
        let report = `### 🛡️ Twój Model Zagrożeń\n\n`;
        
        report += `**Twoje założenia:**\n`;
        report += `- **Chronię:** ${labels.asset}\n`;
        report += `- **Przed kim:** ${labels.adversary}\n`;
        report += `- **Ryzyko:** ${labels.prob}\n`;
        report += `- **Skutki:** ${labels.impact}\n`;
        report += `- **Akceptowane tarcie:** ${labels.friction}\n\n`;
        
        report += `---\n\n### 🔍 Analiza OPSEC:\n\n`;

        // 1. Najsłabsze ogniwo
        if (riskScore >= 2.5 && friction === 1) {
            report += `**❌ 1. Zasada najsłabszego ogniwa: NARUSZONA**\n> Chronisz ważne aktywo przed poważnym zagrożeniem, ale deklarujesz zerowe tarcie. Twoje zabezpieczenia są iluzją. Najsłabszym ogniwem jest Twoja wygoda.\n\n`;
        } else {
            report += `**✅ 1. Zasada najsłabszego ogniwa: ZALICZONA**\n> Poziom zabezpieczeń jest adekwatny do zidentyfikowanego ryzyka.\n\n`;
            passed++;
        }

        // 2. Minimalizm
        if (riskScore <= 1.5 && friction === 3) {
            report += `**❌ 2. Minimalizm (KISS): NARUSZONA**\n> Wdrażasz skomplikowane zabezpieczenia dla niskiego ryzyka. To niepotrzebna złożoność.\n\n`;
        } else {
            report += `**✅ 2. Minimalizm (KISS): ZALICZONA**\n> Poziom skomplikowania jest proporcjonalny do chronionych zasobów.\n\n`;
            passed++;
        }

        // 3. Świadome zaufanie
        if (asset === 3 && friction === 1) {
            report += `**❌ 3. Świadome zaufanie: NARUSZONA**\n> Chronisz krytyczne dane, ale godzisz się na "zero tarcia". Ślepo ufasz domyślnym ustawieniom i dostawcom, co jest sprzeczne z filozofią Distrust.\n\n`;
        } else {
            report += `**✅ 3. Świadome zaufanie: ZALICZONA**\n> Twoje decyzje opierają się na świadomym wyborze, a nie ślepym zaufaniu.\n\n`;
            passed++;
        }

        // 4. Ewolucja
        if (adversary === 3 && friction < 3) {
            report += `**⚠️ 4. Ewolucja: DO POPRAWY**\n> Deklarujesz ochronę przed APT, ale nie akceptujesz wysokiego tarcia. Twoje zabezpieczenia są zbyt statyczne.\n\n`;
        } else {
            report += `**✅ 4. Ewolucja: ZALICZONA**\n> Twój model uwzględnia potrzebę adaptacji.\n\n`;
            passed++;
        }

        // Werdykt
        report += `---\n\n### 📋 Werdykt: `;
        if (passed === 4) {
            report += `**PEŁNA SPÓJNOŚĆ**\nTwój model zagrożeń jest logiczny. Możesz czuć się bezpiecznie.`;
        } else if (passed >= 2) {
            report += `**WYMAGA POPRAWY**\nTwój model ma luki. Zwróć uwagę na punkty oznaczone na czerwono.`;
        } else {
            report += `**KRYTYCZNE NIESPÓJNOŚCI**\nTwój model jest wewnętrznie sprzeczny. Twoje bezpieczeństwo może być iluzją.`;
        }

        resultMarkdown.value = report;
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
