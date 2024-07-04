export type Veranstaltung = {
    ID: string;
    title: string;
    from: Date;
    to: Date;
  };

export type Veranstaltungen = {
    events: Veranstaltung[];
}

export type Vorlesung = {
    id: string;
    title: string;
    date: string;
    time: string;
}