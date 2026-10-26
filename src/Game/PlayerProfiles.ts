export enum PlayerType {
  None = 'None',
  Human = 'Human',
  FirstAI = 'FirstAI',
  LastAI = 'LastAI',
  Random = 'Random',
  MCTS = 'MCTS',
  AZ = 'AZ',
  Hunter = 'Hunter',
  Tactician = 'Tactician'
}

export const PlayerProfiles: Record<PlayerType, { name: string, description: string, badge: string, initial: string }> = {
  [PlayerType.Human]: { name: 'Ty · gracz lokalny', description: 'Twoje pionki, Twoje decyzje. Możesz też grać z kimś na jednym ekranie.', badge: 'Gracz', initial: 'TY' },
  [PlayerType.FirstAI]: { name: 'Franek · odkrywca', description: 'Chętnie wypuszcza nowe pionki i wybiera pierwszy dostępny ruch.', badge: 'Prosty', initial: 'F' },
  [PlayerType.LastAI]: { name: 'Julek · sprinter', description: 'Prowadzi najdalej wysunięty pionek prosto do mety.', badge: 'Prosty', initial: 'J' },
  [PlayerType.Random]: { name: 'Fela · szczęściara', description: 'Idzie za intuicją. Każdy dostępny ruch ma u niej równe szanse.', badge: 'Losowy', initial: 'F' },
  [PlayerType.AZ]: { name: 'Zosia · ostrożna', description: 'Sprawdza zagrożenia i szuka bezpiecznego miejsca dla pionków.', badge: 'Ostrożny', initial: 'Z' },
  [PlayerType.MCTS]: { name: 'Bruno · analityk', description: 'Rozważa możliwe dalsze ruchy, zanim podejmie decyzję.', badge: 'Analityczny', initial: 'B' },
  [PlayerType.Hunter]: { name: 'Leon · łowca', description: 'Wypatruje okazji do zbicia. Lubi pokrzyżować plany rywalom.', badge: 'Ofensywny', initial: 'L' },
  [PlayerType.Tactician]: { name: 'Mila · taktyczka', description: 'Łączy wyścig do mety ze zbijaniem i unikaniem zagrożeń.', badge: 'Zrównoważony', initial: 'M' },
  [PlayerType.None]: { name: 'Wolne miejsce', description: 'Ten kolor nie bierze udziału w rozgrywce.', badge: 'Nie gra', initial: '–' }
}

export const PlayersTypes = Object.keys(PlayerProfiles) as PlayerType[]
export const ColorNames = ['', 'Zieloni', 'Żółci', 'Czerwoni', 'Niebiescy']
