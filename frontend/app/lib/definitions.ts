export type Vorlesung = {
    id: string,
    name: string
    from: string
}

export type VorlesungResponse = {
    vorlesungen: Vorlesung[];
}