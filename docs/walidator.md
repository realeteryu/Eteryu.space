---
title: Walidator Modelu Zagrożeń
description: Interaktywne narzędzie do sprawdzania spójności Twojego modelu zagrożeń z zasadami OPSEC.
icon: lucide/shield-check
---

# Walidator Modelu Zagrożeń

To narzędzie pomoże Ci sprawdzić, czy Twoje podejście do bezpieczeństwa jest wewnętrznie spójne. Odpowiedz na pięć pytań, a skrypt przeanalizuje Twoje wybory przez pryzmat czterech fundamentów OPSEC z artykułu o [modelowaniu zagrożeń](fundamenty/modelowanie-zagrozen.md).

<div class="tm-validator">
    <div id="tm-form">
        <div class="form-group">
            <label for="q1">1. Co chronisz?</label>
            <select id="q1">
                <option value="" disabled selected>-- Wybierz opcję --</option>
                <option value="1">Poboczne konto (forum, VOD)</option>
                <option value="2">Główna skrzynka e-mail / tożsamość</option>
                <option value="3">Komunikacja z aktywistami / dane wrażliwe</option>
            </select>
        </div>

        <div class="form-group">
            <label for="q2">2. Przed kim się chronisz?</label>
            <select id="q2">
                <option value="" disabled selected>-- Wybierz opcję --</option>
                <option value="1">Zautomatyzowane boty / masowe wycieki</option>
                <option value="2">Korporacyjne profilowanie / złodzieje fizyczni</option>
                <option value="3">Dedykowany atak APT / służby</option>
            </select>
        </div>

        <div class="form-group">
            <label for="q3">3. Jak realny jest atak?</label>
            <select id="q3">
                <option value="" disabled selected>-- Wybierz opcję --</option>
                <option value="1">Niskie prawdopodobieństwo (rzadkie)</option>
                <option value="2">Umiarkowane (kilka razy w roku)</option>
                <option value="3">Wysokie (codzienne zagrożenie)</option>
            </select>
        </div>

        <div class="form-group">
            <label for="q4">4. Jakie będą skutki przełamania?</label>
            <select id="q4">
                <option value="" disabled selected>-- Wybierz opcję --</option>
                <option value="1">Marginalne (utrata dostępu do VOD)</option>
                <option value="2">Dokuczliwe (spam, utrata reputacji)</option>
                <option value="3">Katastrofalne (kradzież pieniędzy, deanonimizacja)</option>
            </select>
        </div>

        <div class="form-group">
            <label for="q5">5. Ile tarcia (niewygody) akceptujesz?</label>
            <select id="q5">
                <option value="" disabled selected>-- Wybierz opcję --</option>
                <option value="1">Zero (chcę klikać jak najmniej)</option>
                <option value="2">Umiarkowane (dodatkowe hasło, aplikacja 2FA)</option>
                <option value="3">Wysokie (klucz sprzętowy, PIN, cold storage)</option>
            </select>
        </div>

        <button id="tm-generate">Wygeneruj model</button>
    </div>

    <div id="tm-result-container">
        <label for="tm-result-markdown">Twój raport (Markdown):</label>
        <textarea id="tm-result-markdown" readonly></textarea>
        <button id="tm-copy">Kopiuj do schowka</button>
    </div>
</div>
