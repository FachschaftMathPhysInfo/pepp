export type Event = {
    id: string;
    title: string;
    from: Date;
    to: Date;
  };

export type EventResponse = {
    events: Event[];
}