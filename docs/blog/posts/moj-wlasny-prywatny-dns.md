---
date: 2026-10-12
title: Mój własny DNS. Bez serwera, bez logów.
description: Zbudowałem własny resolver DNS, który blokuje reklamy, trackery, malware i phishing. Bez panelu, bez logów, bez kompromisów.
categories:
  - Prywatność
  - DNS
tags:
  - dns
  - privacy
  - no-logs
  - self-hosted
authors:
  - Eteryu
---

Kiedyś używałem publicznego DNS z filtrowaniem. Działał dobrze. Blokował większość reklam, trackerów i tego całego śmiecia, który ciągnie się za każdą stroną. Ale zawsze brakowało mi jednej rzeczy: kontroli.

W publicznych resolverach, takich jak NextDNS czy AdGuard DNS, wybierasz listy z gotowego katalogu. Ja chciałem sam decydować, z których źródeł korzystam, jak je łączę i co z nich wyciągam. Pi-hole też na to pozwala, ale wymaga serwera w domu i domyślnie działa tylko w sieci lokalnej. Żeby filtrował poza domem, trzeba stawiać VPN albo wystawiać go jako publiczny endpoint. Ja nie chciałem ani jednego, ani drugiego.

<!-- more -->

To mnie uwierało. Nie z powodu paranoi, ale z poczucia, że oddaję kontrolę nad czymś fundamentalnym. Nad tym, jak moje urządzenia łączą się ze światem.

## Co to właściwie jest?

Zbudowałem swój własny serwer DNS. Stoi w chmurze (konkretnie na Cloudflare Workers), więc mam do niego dostęp z każdego miejsca na świecie. Nie potrzebuję do tego żadnego sprzętu, żadnego Raspberry Pi, żadnego VPN-a. Filtruje ruch według list, które sam wybieram i sam układam.

Cały proces wygląda bardzo prosto:
1. Moje urządzenie pyta mój serwer o adres jakiejś strony.
2. Serwer sprawdza, czy ta domena znajduje się na przygotowanej przeze mnie liście.
3. Jeśli jest – serwer natychmiast odpowiada „nie znam takiej strony".
4. Jeśli nie ma jej na liście – przekazuje zapytanie dalej, do zaufanego upstreamu.

Blokuję reklamy, trackery, telemetrię, domeny malware i phishing. Korzystam z kilkunastu starannie wybranych źródeł. Część z nich skupia się na reklamach (OISD, HaGeZi), część na globalnych zagrożeniach phishingowych (Phishing Army), a inne dostarczają unikalnej wiedzy o polskim internecie (Cert Polska, MajkiIT, KADhosts).

!!! warning "Pierwsza warstwa"
    Warto pamiętać, że to działa na poziomie DNS. Nie blokuje reklam w YouTube ani elementów wewnątrz strony. Do tego potrzebny jest osobny content blocker w przeglądarce. Mój resolver jest tylko (i aż) pierwszą warstwą ochrony.

## Jak łączę listy i usuwam duplikaty

To, co opisałem wyżej, to sam resolver. Ale on nie działa w próżni. Potrzebuje listy, na której może pracować. Przygotowanie tej listy to druga, osobna część całego rozwiązania.

Pipeline jest na tyle elastyczny, że potrafi przeczytać najpopularniejsze formaty. Świadomie wybieram jednak te najlżejsze, aby maksymalnie odciążyć procesor.

| Format | Przykład zapisu | Status |
| :--- | :--- | :--- |
| **`domains`** | `domena.com` | Preferowany (najlżejszy) |
| **`domainswild`** | `*.domena.com` | Wspierany |
| **`hosts`** | `0.0.0.0 domena.com`<br>`127.0.0.1 domena.com`<br>`::1 domena.com` | Wspierany |
| **`dnsmasq`** | `address=/domena.com/`<br>`server=/domena.com/` | Preferowany |
| **`adblock`** | `\|\|domena.com^` (ignoruje `$`) | Wspierany (awaryjnie) |

Problem z wieloma źródłami jest taki, że często się nakładają. Ta sama domena może pojawić się w trzech, czterech, pięciu listach jednocześnie. Gdybym wrzucił wszystko do jednego worka bez czyszczenia, miałbym listę pełną powtórzeń, większą niż potrzeba i wolniejszą w działaniu.

Zamiast tego mój pipeline robi dwie rzeczy:
* **Deduplikacja:** Zbiera wszystkie domeny do jednego zbioru, który z definicji nie może zawierać duplikatów.
* **Aglomeracja:** Usuwa redundantne subdomeny. Jeśli na liście jest `example.com`, nie ma sensu trzymać `ads.example.com` i `track.example.com`. Każda z tych subdomen zostanie zablokowana przez domenę nadrzędną.

Efekt tych operacji z ostatniego przebiegu wygląda następująco:

| Etap | Liczba wpisów |
| :--- | :--- |
| Surowych linii z wszystkich źródeł | 1 160 757 |
| Po deduplikacji (usunięcie powtórek) | 543 624 |
| **Po aglomeracji (gotowa lista)** | **393 316** |
| *Usunięto redundantnych subdomen* | *150 308* |

!!! note "Automatyzacja"
    Ten proces dzieje się raz dziennie. Ja nie muszę nic robić. Lista sama się aktualizuje, sama się czyści i sama trafia do mojego resolvera.

## Dlaczego to nie ma panelu ani statystyk?

Mój resolver nie ma panelu administracyjnego. Nie ma wykresów, nie ma listy ostatnich zapytań, nie ma licznika zablokowanych domen.

To celowa decyzja. Panel ze statystykami oznacza, że ktoś, nawet jeśli tylko ja, gdzieś te dane przechowuje. Lista ostatnich zapytań to nic innego jak historia tego, co robię w internecie. A ja nie chcę, żeby taka historia istniała w jakiejkolwiek formie.

!!! success "Filozofia Zero-Logs"
    Mój resolver przetwarza zapytanie, zwraca odpowiedź i zapomina. Nie zapisuje niczego i nie analizuje. Nie ma czego nie logować, bo nie ma gdzie logować.

## Dla kogo to jest

To rozwiązanie dla kogoś, kto ma kilka urządzeń i chce, żeby wszystkie filtrowały tak samo. Telefon, laptop, tablet, cokolwiek. Bez instalowania osobnych aplikacji na każdym z nich. Dla kogoś, kto ceni prywatność i chce sam decydować, co blokuje, zamiast czekać, aż ktoś inny zrobi to za niego.

Jeśli zależy Ci na panelu i statystykach, inne rozwiązania zrobią to lepiej. Ale jeśli cenisz kontrolę i prywatność bardziej niż wygodę, to jest dokładnie to.
