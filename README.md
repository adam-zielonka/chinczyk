# Chińczyk

Klasyczna gra dla 2–4 osób przy jednym ekranie. Graj ze znajomymi, z komputerowymi przeciwnikami albo obserwuj ich partię.

Kliknij dowolne miejsce w jednej z czterech baz na planszy, a następnie wybierz gracza w otwartym oknie. Każdy styl gry ma własny symbol zamiast inicjałów; symbole na pionkach oznaczają ich kolory i można je włączyć w ustawieniach (domyślnie są wyłączone, również na polach planszy). Gdy obsada jest gotowa, kliknij **Zagrajmy**. W swojej kolejce rzuć kostką, a potem wybierz podświetlony pionek. Gdy nie ma dostępnego ruchu, przekaż kolejkę. Rozgrywkę można wstrzymać, a tempo przeciwników ustawić w rozwijanych **Ustawieniach**. Przycisk **Zasady gry** nad ustawieniami otwiera krótką pomoc i wstrzymuje trwającą partię; wróć do niej przyciskiem **Wznów grę**. W ustawieniach znajdziesz też wybór języka, przełącznik symboli pionków i pól i link do kodu źródłowego. Wybór symboli jest zapamiętywany na tym urządzeniu. Na telefonie kostka i przyciski pozostają pod ręką u dołu ekranu.

Przeciwnicy mają różne style: Franek wypuszcza pionki, Julek prowadzi sprintera, Fela wybiera losowo, Zosia ocenia zagrożenia, a Bruno analizuje możliwe kontynuacje. Nowi przeciwnicy to **Leon**, który szuka okazji do zbicia, i **Mila**, która łączy postęp z oceną zagrożeń oraz zbijaniem.

Instrukcje uruchamiania i sprawdzania projektu: [DEVELOPMENT.md](DEVELOPMENT.md).


## Language / Język

The browser version supports Polish and English. On the first visit it uses the
first supported language from the browser’s preferences, falling back to English.
The Polski / English buttons in Settings save an explicit choice
in this application’s local storage.
Switching language preserves the current game. If storage is blocked, language switching
still works for the current visit.
