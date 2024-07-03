"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import EventTable from "@/app/form-tutor/ui/table/table";
import { Header } from "@/components/header"
import { useState } from "react";
import { client } from "../lib/graphClient";
import { ADD_TUTOR } from "../lib/queries";

const inputDivStyling = "w-96 my-3"
const tableDivStyling = "my-10 w-full h-full"

export default function Page() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [eventsAvailable, setEventsAvailable] = useState([]);

    const handleFormSubmit = async(e: React.FormEvent) => {
        e.preventDefault();
        const variables = {
            firstName,
            lastName,
            email,
            eventsAvailable,
          };
        
        client.request(ADD_TUTOR, variables);
    }
    return (
        <div className="w-full h-full">
            <Header></Header>
            <div className="w-fit mx-auto p-10">
                <h1 className="font-bold text-2xl">Anmeldung Vorkurstutor:in</h1>

                <div className={inputDivStyling}>
                    <Input 
                    placeholder="Vorname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}/>
                </div>

                <div className={inputDivStyling}>
                    <Input placeholder="Nachname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}/>
                </div>

                <div className={inputDivStyling}>
                    <Input 
                    type="email" 
                    placeholder="E-Mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className={tableDivStyling}>
                    <EventTable vorlesungen={[]}/>
                </div>

                <div className={inputDivStyling}>
                    <Button onClick={handleFormSubmit}>Submit</Button>
                </div>
            </div>
        </div>
    )
}