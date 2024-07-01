"use client"

import { useState } from 'react';

export default function AddTutor() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [eventsAvailable, setEventsAvailable] = useState([]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const graphcmsEndpoint = 'http://localhost:8080/api';

    const mutation = `
      mutation($firstName:String!, $lastName:String!, $email:String!, $eventsAvailable:[UUID!]) {
        addTutor(tutor: {
          fn: $firstName
          sn: $lastName
          mail: $email
          eventsAvailable: $eventsAvailable
        }) 
      }`
    ;

    const variables = {
      firstName,
      lastName,
      email,
      eventsAvailable,
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    };

    try {
      const response = await fetch(graphcmsEndpoint, requestOptions);
      const data = await response.json();
      console.log('Mutation response:', data);

      // Handle success or error states based on 'data' response
    } catch (error) {
      console.error('Error performing mutation:', error);
      // Handle error states
    }
  };

  return (
    <div>
      <h1>Add a New Tutor</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Events Available:</label>
          <input
            type="text"
            value={eventsAvailable}
            onChange={(e) => setEventsAvailable(e.target.value.split(','))}
            required
          />
          {/* Assuming eventsAvailable is a comma-separated list of UUIDs */}
        </div>
        <button type="submit">Add Tutor</button>
      </form>
    </div>
  );
}