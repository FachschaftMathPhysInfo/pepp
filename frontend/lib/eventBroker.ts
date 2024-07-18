class EventBroker {
    selectedEvents: number[] = []

    addEvent(eventID: number):void {
        this.selectedEvents.push(eventID)
    }

    removeEvent(eventID: number): void {
        const index = this.selectedEvents.indexOf(eventID)
        if (index > -1) this.selectedEvents.splice(index, 1)
    }

    getEvents(): number[] {
        return this.selectedEvents
    }
}

export let eventBroker = new EventBroker()